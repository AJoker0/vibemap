'use client'

import React, { useEffect, useState } from 'react'
import { TileLayer, useMap } from 'react-leaflet'

// Определение типа для провайдеров тайлов
interface TileProvider {
  name: string
  url: string
  attribution: string
  subdomains: string
  maxZoom?: number
}

// Список надежных провайдеров тайлов, которые мы будем использовать как резервные варианты
const TILE_PROVIDERS: TileProvider[] = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  {
    name: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  {
    name: 'OpenStreetMap DE',
    url: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  {
    name: 'CyclOSM',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution:
      '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 20,
  },
  {
    name: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  {
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
    subdomains: 'abcd',
    maxZoom: 18,
  },
  {
    name: 'Jawg Maps',
    url: 'https://tile.jawg.io/jawg-light/{z}/{x}/{y}.png?access-token=anonymous',
    attribution:
      '<a href="https://www.jawg.io" target="_blank">&copy; Jawg</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 22,
  },
]

// Спутниковые провайдеры
const SATELLITE_PROVIDERS: TileProvider[] = [
  {
    name: 'Esri WorldImagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, Maxar, GeoEye, Earthstar Geographics',
    subdomains: '',
    maxZoom: 19,
  },
  {
    name: 'USGS Imagery',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
    attribution: 'USGS, National Map',
    subdomains: '',
    maxZoom: 16,
  },
]

// Темные провайдеры
const DARK_PROVIDERS: TileProvider[] = [
  {
    name: 'Carto Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  {
    name: 'Jawg Dark',
    url: 'https://tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?access-token=anonymous',
    attribution:
      '<a href="https://www.jawg.io" target="_blank">&copy; Jawg</a>',
    subdomains: 'abcd',
    maxZoom: 22,
  },
]

interface ReliableTileLayerProps {
  selectedLayer: string
  onError: (error: string) => void
  onLoading: (isLoading: boolean) => void
}

const ReliableTileLayer: React.FC<ReliableTileLayerProps> = ({
  selectedLayer,
  onError,
  onLoading,
}) => {
  const map = useMap()
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0)
  const [currentMapType, setCurrentMapType] = useState(selectedLayer)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_errorCount, setErrorCount] = useState(0)
  const [loadingTilesCount, setLoadingTilesCount] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  // Выбираем список провайдеров на основе выбранного типа карты
  const getProviders = (): TileProvider[] => {
    if (selectedLayer === 'satellite')
      return SATELLITE_PROVIDERS as TileProvider[]
    if (selectedLayer === 'dark') return DARK_PROVIDERS as TileProvider[]
    return TILE_PROVIDERS
  }

  const currentProvider = getProviders()[currentProviderIndex]
  // Переключение на следующего провайдера при ошибках
  const switchToNextProvider = () => {
    const providers = getProviders()
    const nextIndex = (currentProviderIndex + 1) % providers.length
    setCurrentProviderIndex(nextIndex)

    onError(`Map loading issue. Switching to ${providers[nextIndex].name}...`)
    setTimeout(() => onError(''), 3000)

    // Очистка кеша тайлов
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes('tile') || name.includes('map')) {
            caches.delete(name)
          }
        })
      })
    } // Принудительно обновим карту
    setTimeout(() => {
      try {
        map.invalidateSize()
        map.fire('reloadtiles')
        // Принудительно перерисовать все тайлы
        if (map && (map as any)._layers) {
          Object.values((map as any)._layers).forEach((layer: any) => {
            if (layer._url && layer.redraw) {
              layer.redraw()
            }
          })
        }
      } catch (e) {
        console.error('Error refreshing map tiles:', e)
      }
    }, 500)

    setRetryCount((prev) => prev + 1)
  }

  // Сброс счетчиков при изменении типа карты
  useEffect(() => {
    if (currentMapType !== selectedLayer) {
      setCurrentMapType(selectedLayer)
      setCurrentProviderIndex(0)
      setErrorCount(0)
    }
  }, [selectedLayer, currentMapType])
  // Установка обработчиков событий для тайлов
  useEffect(() => {
    // Предварительно загрузим тайлы для текущего вида
    const preloadMapTiles = () => {
      try {
        const currentBounds = map.getBounds()
        const currentZoom = map.getZoom()

        if (currentBounds && currentZoom) {
          // Создаем невидимые img элементы для предварительной загрузки тайлов
          const provider = getProviders()[currentProviderIndex]
          const tileSize = 256
          const nwPoint = map.project(currentBounds.getNorthWest(), currentZoom)
          const sePoint = map.project(currentBounds.getSouthEast(), currentZoom)

          // Рассчитываем тайлы, видимые в текущем окне карты
          const startX = Math.floor(nwPoint.x / tileSize)
          const startY = Math.floor(nwPoint.y / tileSize)
          const endX = Math.floor(sePoint.x / tileSize)
          const endY = Math.floor(sePoint.y / tileSize)

          // Предварительная загрузка ближайших тайлов
          const fragment = document.createDocumentFragment()
          for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
              if (x >= 0 && y >= 0) {
                const url = provider.url
                  .replace('{z}', currentZoom.toString())
                  .replace('{x}', x.toString())
                  .replace('{y}', y.toString())
                  .replace('{r}', '')

                const img = new Image()
                img.style.display = 'none'
                img.src = url
                fragment.appendChild(img)

                // Удаляем изображения через небольшой промежуток времени
                setTimeout(() => {
                  if (fragment.contains(img)) {
                    fragment.removeChild(img)
                  }
                }, 5000)
              }
            }
          }

          // Добавляем невидимые изображения в DOM для загрузки
          document.body.appendChild(fragment)
          setTimeout(() => {
            if (document.body.contains(fragment)) {
              document.body.removeChild(fragment)
            }
          }, 5000)
        }
      } catch (e) {
        console.error('Error preloading tiles:', e)
      }
    }

    // Обработчик ошибок загрузки тайлов
    const handleTileError = (_e: any) => {
      setErrorCount((prev) => {
        const newCount = prev + 1

        // Более агрессивное переключение провайдеров при ошибках
        if (newCount > 3) {
          setTimeout(switchToNextProvider, 300)
          return 0
        }

        // При частых ошибках очищаем кеш браузера для тайлов
        if (newCount === 3 && retryCount < 2) {
          try {
            // Очистка localStorage от кеша тайлов
            Object.keys(localStorage).forEach((key) => {
              if (
                key.includes('leaflet') ||
                key.includes('tile') ||
                key.includes('map')
              ) {
                localStorage.removeItem(key)
              }
            })

            // Запрос на очистку кеша браузера для тайлов
            if ('caches' in window) {
              caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                  if (cacheName.includes('tile') || cacheName.includes('map')) {
                    caches.delete(cacheName)
                  }
                })
              })
            }
          } catch (err) {
            console.error('Error clearing cache:', err)
          }
        }

        return newCount
      })
    }

    const handleTileLoad = () => {
      setLoadingTilesCount((prev) => {
        const newCount = Math.max(0, prev - 1)
        onLoading(newCount > 0)
        return newCount
      })

      // Успешно загрузили тайл, сбрасываем счетчик ошибок
      setErrorCount(0)
    }

    const handleTileLoadStart = () => {
      setLoadingTilesCount((prev) => {
        const newCount = prev + 1
        onLoading(true)
        return newCount
      })
    }

    // Инициализируем предварительную загрузку тайлов
    preloadMapTiles()

    map.on('tileerror', handleTileError)
    map.on('tileload', handleTileLoad)
    map.on('tileloadstart', handleTileLoadStart)
    map.on('moveend', preloadMapTiles)
    return () => {
      map.off('tileerror', handleTileError)
      map.off('tileload', handleTileLoad)
      map.off('tileloadstart', handleTileLoadStart)
      map.off('moveend', preloadMapTiles)
    }
  }, [map, onError, onLoading, currentProviderIndex, retryCount])

  // Эффект для переключения провайдера по таймауту, если тайлы не загружаются долго
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loadingTilesCount > 10) {
        console.log('Tile loading timeout - switching providers')
        switchToNextProvider()
      }
    }, 8000)

    return () => clearTimeout(timeoutId)
  }, [loadingTilesCount])

  return (
    <TileLayer
      key={`tile-layer-${currentProviderIndex}-${selectedLayer}`}
      attribution={currentProvider.attribution}
      url={currentProvider.url}
      errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      maxZoom={currentProvider.maxZoom || 19}
      minZoom={2}
      tileSize={256}
      keepBuffer={3}
      updateWhenZooming={false}
      updateWhenIdle={true}
      subdomains={currentProvider.subdomains}
      zIndex={1}
      className="map-tiles hardware-accelerated"
      crossOrigin="anonymous"
    />
  )
}

export default ReliableTileLayer

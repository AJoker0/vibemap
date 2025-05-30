// src/components/ui/Input/Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'error', 'success'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Type something...',
    variant: 'default',
  },
}

export const Error: Story = {
  args: {
    placeholder: 'There was an error',
    variant: 'error',
  },
}

export const Success: Story = {
  args: {
    placeholder: 'Success input',
    variant: 'success',
  },
}

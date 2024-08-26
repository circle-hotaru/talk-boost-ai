import React from 'react'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type SettingsProps = {
  isTTSEnabled: boolean
  onTTSToggle: (enabled: boolean) => void
  onClose: () => void
}

const Settings: React.FC<SettingsProps> = ({
  isTTSEnabled,
  onTTSToggle,
  onClose,
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>
            Enable auto Text-to-Speech
          </span>
          <Switch
            checked={isTTSEnabled}
            onCheckedChange={onTTSToggle}
            className='
             data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200
             data-[state=checked]:hover:bg-blue-600 data-[state=unchecked]:hover:bg-gray-300'
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Settings

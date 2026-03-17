import { ReactNode } from 'react'

interface ModalOverlayProps {
  onClose: () => void
  children: ReactNode
}

export function ModalOverlay({ onClose, children }: ModalOverlayProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

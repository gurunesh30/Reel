/**
 * Swipe-to-Dismiss Bottom Sheet Drawer
 * Implements Micro-UX Pattern #8 (Touch drag gestures with spring physics via Vaul)
 * and Micro-UX Pattern #11 (Safe Area Insets compliance)
 */

import React from 'react';
import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '../../utils/cn';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className,
}: DrawerProps) {
  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <VaulDrawer.Trigger asChild>{trigger}</VaulDrawer.Trigger>}
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity" />
        <VaulDrawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
            'bg-[#16191E] border-t border-white/10 text-white shadow-2xl',
            'rounded-t-[28px] max-h-[92vh] outline-none',
            'pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]',
            className
          )}
        >
          {/* Touch Drag Indicator Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-600/70 my-3 transition-colors hover:bg-gray-400 cursor-grab active:cursor-grabbing" />

          {/* Hidden Accessible Title/Desc if not visible */}
          {title ? (
            <div className="px-6 pt-1 pb-2">
              <VaulDrawer.Title className="text-xl font-bold tracking-tight text-white balanced-text">
                {title}
              </VaulDrawer.Title>
              {description && (
                <VaulDrawer.Description className="text-sm text-gray-400 mt-1">
                  {description}
                </VaulDrawer.Description>
              )}
            </div>
          ) : (
            <VaulDrawer.Title className="sr-only">Drawer Dialog</VaulDrawer.Title>
          )}

          {/* Sheet Body Content */}
          <div className="px-6 overflow-y-auto max-h-[78vh] overscroll-contain">
            {children}
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}

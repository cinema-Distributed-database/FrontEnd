'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = ({ children, value, onValueChange, disabled }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (newValue) => {
    onValueChange(newValue);
    setOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => !disabled && setOpen(!open),
            value,
            disabled,
          });
        }
        if (child.type === SelectContent) {
          return open
            ? React.cloneElement(child, {
                onSelect: handleSelect,
                onClose: () => setOpen(false),
              })
            : null;
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(
  ({ className, children, onClick, value, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={onClick}
        disabled={disabled}
        type="button"
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, children }) => {
  return <span className="text-sm">{children || placeholder}</span>;
};

const SelectContent = ({ children, className, onSelect, onClose, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80',
        className
      )}
      {...props}
    >
      <div className="w-full p-1">
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect: () => onSelect(child.props.value),
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = React.forwardRef(({ className, children, value, onSelect, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer',
        className
      )}
      onClick={onSelect}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* Checkmark can be added here if needed */}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
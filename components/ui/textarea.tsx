import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { TextInput, type TextInputProps } from 'react-native';
import { THEME } from '@/lib/theme';

function Textarea({
  className,
  multiline = true,
  numberOfLines = 8, // On native, it determines the maximum height.
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  const { colorScheme } = useColorScheme();
  const placeholderColor = THEME[colorScheme ?? 'light'].mutedForeground;

  return (
    <TextInput
      className={cn(
        'text-foreground border-input dark:bg-input/30 flex min-h-16 w-full flex-row rounded-md border bg-transparent px-3 py-2 text-base shadow-sm shadow-black/5 md:text-sm',
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      placeholderTextColor={placeholderColor}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };

declare module 'react-native-vector-icons/MaterialIcons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  export interface MaterialIconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  const MaterialIcon: ComponentType<MaterialIconProps>;
  export default MaterialIcon;
}

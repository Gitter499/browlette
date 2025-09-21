import 'styled-components';
import { theme } from '../styles/theme';

declare module 'styled-components' {
  public interface DefaultTheme extends Readonly<typeof theme> {}
}

import { memo } from 'react';
import FuncButton from '../FuncButton/FuncButton.tsx';
import SettingIcon from '../Icon/SettingIcon.tsx';

const SettingButton = memo(() => (
  <FuncButton icon={<SettingIcon />} className='mika-video-player-toolbar-function-Setting-button' onClick={() => {}} />
));

SettingButton.displayName = 'SettingButton';
export default SettingButton;

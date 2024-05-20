import { memo } from 'react';
import FuncButton from '../FuncButton/FuncButton.tsx';
import SettingIcon from '../Icon/SettingIcon.tsx';

import './SettingButton.less';

const SettingButton = memo(() => {

  return (
    <div className='mika-video-player-toolbar-function-Setting-button-container'>
      <FuncButton
        icon={<SettingIcon />}
        onClick={() => {

        }}
      />
    </div>
  );
});

SettingButton.displayName = 'SettingButton';
export default SettingButton;

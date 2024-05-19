import { memo } from 'react';
import FuncButton from '../FuncButton/FuncButton.tsx';
import SettingIcon from '../Icon/SettingIcon.tsx';

import './SettingButton.less';
import { usePanel } from '../../../Hooks';

const SettingButton = memo(() => {
  const [showPanel, setShowPanel] = usePanel({
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  });

  return (
    <div className='mika-video-player-toolbar-function-Setting-button-container'>
      <FuncButton
        icon={<SettingIcon />}
        onClick={() => {
          setShowPanel(!showPanel);
        }}
      />
    </div>
  );
});

SettingButton.displayName = 'SettingButton';
export default SettingButton;

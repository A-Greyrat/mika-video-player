import { memo } from 'react';

const ForwardInfo = memo(() => (
  <div
    style={{
      width: '5.5rem',
      height: '1.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '5px',
      fontSize: '1.2rem',
      padding: '0.4rem',
      position: 'absolute',
      top: '15%',
      left: '50%',
      transform: 'translate(-50%, 0)',
    }}
  >
    快进 3x
  </div>
));

export default ForwardInfo;

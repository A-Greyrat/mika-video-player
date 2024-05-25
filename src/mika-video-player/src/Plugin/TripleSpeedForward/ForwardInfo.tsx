import { memo } from 'react';

const ForwardInfo = memo(() => (
  <div
    style={{
      width: '80px',
      height: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '5px',
      fontSize: '17px',
      padding: '6px',
      position: 'absolute',
      fontWeight: '300',
      top: '0',
      left: '50%',
      transform: 'translate(-50%, 20px)',
    }}
  >
    快进 3x
  </div>
));

export default ForwardInfo;

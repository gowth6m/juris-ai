import ReactPlayer from 'react-player';
import React, { useState } from 'react';

import { Skeleton } from '@mui/material';

interface Props {
  url: string;
}

const CoreVideoPlayer: React.FC<Props> = ({ url }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading && (
        <Skeleton variant="rectangular" height="100%" width="100%" sx={{ aspectRatio: '16/9' }} />
      )}
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        style={{
          aspectRatio: '16/9',
          display: loading ? 'none' : 'block',
        }}
        controls
        onReady={() => setLoading(false)}
      />
    </div>
  );
};

export default CoreVideoPlayer;

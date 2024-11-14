import { Box, LinearProgress } from '@mui/material';

const LoadingTopbar = () => {
  return (
    <Box sx={styles.Box}>
      <LinearProgress style={styles.LinearProgress} />
    </Box>
  );
};

const styles = {
  Box: {
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1400,
  },
  LinearProgress: {
    height: 8,
  },
};

export default LoadingTopbar;

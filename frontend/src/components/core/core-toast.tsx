import React from 'react';
import { Toaster, ToasterProps } from 'react-hot-toast';

interface Props extends ToasterProps {}

const CoreToast: React.FC<Props> = ({ ...props }) => {
  return (
    <Toaster
      toastOptions={{
        style: {
          width: '360px',
        },
        success: {
          style: {
            background: '#4CAF50',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#C33C54',
            color: 'white',
          },
        },
      }}
      position="top-center"
      {...props}
    />
  );
};

export default CoreToast;

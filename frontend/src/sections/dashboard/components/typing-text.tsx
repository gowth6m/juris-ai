import { useState, useEffect } from 'react';

import { Box, BoxProps, keyframes } from '@mui/material';

export default function TypingText({ ...props }: BoxProps) {
  const typingDelay: number = 100;
  const deletingDelay: number = 60;
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(typingDelay);
  const [, setIndex] = useState(1);
  const period = 2000;

  const toRotate = [
    'AI is analyzing the contract',
    'We are almost there',
    'Just a few more seconds',
    'Please wait',
    'Almost done',
    'Just a moment',
  ];

  useEffect(() => {
    const ticker = setInterval(() => {
      tick();
    }, delta);

    return () => {
      clearInterval(ticker);
    };
  });

  const tick = () => {
    const i = loopNum % toRotate.length;
    const fullText = toRotate[i];
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(deletingDelay);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setIndex((prevIndex) => prevIndex - 1);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setIndex(1);
      setDelta(typingDelay);
    } else {
      setIndex((prevIndex) => prevIndex + 1);
    }
  };

  const blink = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

  return (
    <Box {...props}>
      <span className="typed-text"> </span>
      <span>{text}</span>
      <Box
        component={'span'}
        sx={{
          animation: `${blink} 1s linear infinite`,
          marginLeft: '2px',
        }}
      >
        |
      </Box>
    </Box>
  );
}

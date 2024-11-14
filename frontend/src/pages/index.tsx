import { Helmet } from 'react-helmet-async';
import { SplashScreen } from '@/components/loading-screen';

// ----------------------------------------------------------------------

export default function IndexPage() {
  return (
    <>
      <Helmet>
        <title>Juris AI</title>
      </Helmet>

      <SplashScreen />
    </>
  );
}

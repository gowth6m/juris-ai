import { Helmet } from 'react-helmet-async';
import ContractReviewView from '@/sections/dashboard/views/contract-review-view';

// ----------------------------------------------------------------------

export default function ContractReviewPage() {
  return (
    <>
      <Helmet>
        <title>Review</title>
      </Helmet>

      <ContractReviewView />
    </>
  );
}

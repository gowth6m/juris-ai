import { useFormik } from 'formik';
import { paths } from '@/routes/paths';
import Row from '@/components/core/row';
import ApiClient from '@/services/api-client';
import Column from '@/components/core/column';
import { useBoolean } from '@/hooks/use-boolean';
import { useQuery, useMutation } from 'react-query';
import { useSnackbar } from '@/components/snackbar';
import { useParams, useRouter } from '@/routes/hooks';
import CoreButton from '@/components/core/core-button';
import { LoadingTopbar } from '@/components/loading-screen';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';
import { ContractReviewPayload } from '@/services/types/contract';

import { Card, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

import LoadingContractPopup from '../components/loading-contract-popup';

// ----------------------------------------------------------------------

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const contractTypeOptions: SelectOption[] = [
  { value: 'service_level_agreement', label: 'Service Level Agreement' },
  { value: 'master_service_agreement', label: 'Master Services Agreement' },
  { value: 'non_disclosure_agreement', label: 'Non-Disclosure Agreement' },
];

const jurisdictionOptions: SelectOption[] = [
  { value: 'united_kingdom', label: 'UK' },
  { value: 'united_states', label: 'US', disabled: true },
];

const industryOptions: SelectOption[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare', disabled: true },
];

// ----------------------------------------------------------------------

const ContractIndexView = () => {
  const router = useRouter();

  const params = useParams();

  const { id: contractId } = params;

  const { enqueueSnackbar } = useSnackbar();

  const loadingPopup = useBoolean();

  // ------------- FORMIK -----------------

  const formik = useFormik({
    initialValues: {
      contractType: '',
      jurisdiction: 'united_kingdom',
      industry: '',
    },
    onSubmit: (values) => {
      console.log(values);
      console.log(`Pushing to ${paths.DASHBOARD.CONTRACT}/${contractId}/review`);
      mReviewContract.mutate({
        contractId: contractId ?? '',
        jurisdiction: values.jurisdiction,
        industry: values.industry,
        contractType: values.contractType,
      });
    },
  });

  // ---------- QUERY & MUTATION ----------

  const qContract = useQuery({
    queryKey: ['getContractById', { contractId: contractId }],
    queryFn: async () => {
      return await ApiClient.contract.getContractById({ contractId: contractId ?? '' });
    },
  });

  const mReviewContract = useMutation({
    mutationKey: 'reviewContract',
    mutationFn: async (input: ContractReviewPayload) => {
      return await ApiClient.contract.reviewContract(input);
    },
    onMutate: () => {
      loadingPopup.onToggle();
    },
    onSuccess: () => {
      router.push(`${paths.DASHBOARD.CONTRACT}/${contractId}/review`);
    },
    onError: (error) => {
      console.error(error);
      loadingPopup.onToggle();
      enqueueSnackbar('Error reviewing contract', { variant: 'error' });
    },
  });

  // ---------- RENDER ----------

  const renderHeader = (
    <CustomBreadcrumbs
      heading={qContract?.data?.data.title ? `Review - ${qContract?.data?.data.title}` : 'Review'}
      links={[
        {
          name: 'Dashboard',
          href: paths.DASHBOARD.INDEX,
        },
        { name: 'Review' },
      ]}
      sx={{
        mb: 3,
      }}
    />
  );

  const renderBody = (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 'md',
      }}
    >
      <Column padding={3} gap={3}>
        <Alert severity="info">
          Please select the contract type, jurisdiction and industry to continue with the review.
        </Alert>

        <FormControl fullWidth margin="none">
          <InputLabel>Contract Type</InputLabel>
          <Select
            label={'Contract Type'}
            value={formik.values.contractType}
            onChange={(e) => {
              formik.setFieldValue('contractType', e.target.value);
            }}
          >
            {contractTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="none">
          <InputLabel>Jurisdiction</InputLabel>
          <Select
            label={'Jurisdiction'}
            value={formik.values.jurisdiction}
            onChange={(e) => {
              formik.setFieldValue('jurisdiction', e.target.value);
            }}
          >
            {jurisdictionOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="none">
          <InputLabel>Industry</InputLabel>
          <Select
            label={'Industry'}
            value={formik.values.industry}
            onChange={(e) => {
              formik.setFieldValue('industry', e.target.value);
            }}
          >
            {industryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Row justifyContent={'space-between'}>
          <CoreButton buttonVariant="secondary" onClick={() => router.back()}>
            Back
          </CoreButton>
          <CoreButton
            disabled={!formik.isValid || mReviewContract.isLoading}
            onClick={() => formik.handleSubmit()}
          >
            Continue
          </CoreButton>
        </Row>
      </Column>
    </Card>
  );

  return (
    <Column>
      {(qContract.isLoading || mReviewContract.isLoading) && <LoadingTopbar />}
      {mReviewContract.isLoading && (
        <LoadingContractPopup open={loadingPopup.value} onClose={loadingPopup.onToggle} />
      )}
      {renderHeader}
      {renderBody}
    </Column>
  );
};

export default ContractIndexView;

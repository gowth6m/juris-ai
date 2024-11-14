import StaticData from '@/assets/data/data';

export const getCountryLabelByCode = (code: string | undefined): string => {
  if (!code) return 'N/A';
  const country = StaticData.COUNTRY_LIST_ALL_ISO.find(
    (country) => country.code === code?.toUpperCase()
  );
  return country ? country.label : 'N/A';
};

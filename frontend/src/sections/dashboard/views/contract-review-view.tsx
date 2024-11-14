import DOMPurify from 'dompurify';
import { useQuery } from 'react-query';
import Row from '@/components/core/row';
import { useParams } from '@/routes/hooks';
import Iconify from '@/components/iconify';
import Column from '@/components/core/column';
import ApiClient from '@/services/api-client';
import Scrollbar from '@/components/scrollbar';
import { LoadingTopbar } from '@/components/loading-screen';
import { useRef, useMemo, useState, useEffect } from 'react';

import {
  Box,
  Chip,
  List,
  alpha,
  ListItem,
  useTheme,
  Accordion,
  Typography,
  GlobalStyles,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// ----------------------------------------------------------------------

const ContractReviewView = () => {
  const params = useParams();

  const { id: contractId } = params;

  const theme = useTheme();

  const [explanation, setExplanation] = useState('');

  const [selectedClauseId, setSelectedClauseId] = useState('');

  const [isExplaining, setIsExplaining] = useState(false);

  const [_, setSelectedClauseContent] = useState('');

  const leftScrollRef = useRef<HTMLDivElement>(null);

  const typingTimeouts = useRef<NodeJS.Timeout[]>([]);

  // ------------- Query -------------

  const qContractReview = useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      return await ApiClient.contract.getContractReview({ contractId: contractId ?? '' });
    },
  });

  // ------------- Handlers -------------

  const explainClause = async (clause: string) => {
    setIsExplaining(true);
    setExplanation('');

    typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    typingTimeouts.current = [];

    try {
      const chunks: string[] = [];

      const onChunkReceived = (chunk: string) => {
        chunks.push(chunk);
      };

      await ApiClient.contract.explainClause(
        { contractId: contractId ?? '', clause },
        onChunkReceived
      );

      let totalDelay = 0;
      const typingSpeed = 2;

      chunks.forEach((chunk) => {
        const characters = chunk.split('');
        characters.forEach((char) => {
          const timeout = setTimeout(() => {
            setExplanation((prev) => prev + char);
          }, totalDelay);
          typingTimeouts.current.push(timeout);
          totalDelay += typingSpeed;
        });
        totalDelay += typingSpeed;
      });
    } catch (error) {
      console.error('Error explaining clause:', error);
      setExplanation('An error occurred while explaining the clause.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleClauseClick = (event: any) => {
    let target = event.target;

    while (target && target !== event.currentTarget) {
      if (target.getAttribute('data-is-clause') === 'true') {
        const clauseId = target.getAttribute('data-clause-id');
        const clauseText = target.textContent;

        if (clauseId) {
          setSelectedClauseId(clauseId);
          setSelectedClauseContent(clauseText || '');
          explainClause(clauseText || '');
        }

        break;
      }
      target = target.parentNode;
    }
  };

  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const scrollToClause = (clauseId: string) => {
    if (leftScrollRef.current) {
      const clauseElement = leftScrollRef.current.querySelector(`[data-clause-id="${clauseId}"]`);
      if (clauseElement) {
        clauseElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setSelectedClauseId(clauseId);
        setSelectedClauseContent(clauseElement.textContent || '');
        explainClause(clauseElement.textContent || '');
      }
    }
  };

  // ------------- Memo values -------------

  const riskyClauseIds = useMemo(() => {
    if (qContractReview.isSuccess && qContractReview.data?.data?.review?.risky_clauses) {
      return qContractReview.data.data.review.risky_clauses.map((clause) => clause.key);
    }
    return [];
  }, [qContractReview.isSuccess, qContractReview.data]);

  const riskyClauseStyles = useMemo(() => {
    if (riskyClauseIds.length > 0) {
      const selectors = riskyClauseIds.map((id) => `[data-clause-id="${id}"]`).join(', ');
      return {
        [selectors]: {
          backgroundColor: alpha(theme.palette.error.light, 0.05),
          borderRadius: 4,
        },
      };
    }
    return {};
  }, [riskyClauseIds, theme.palette]);

  // ------------- CONSTS -------------

  const topSectionHeight = selectedClauseId ? 'calc(100vh/3)' : 'calc(100vh/6)';

  // ------------- Render -------------

  const renderLeftSection = (
    <Box
      sx={{
        flex: 3,
        height: '100vh',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={{
          '[data-is-clause="true"]:hover': {
            color: theme.palette.secondary.contrastText,
            backgroundColor: alpha(theme.palette.secondary.lighter, 0.5),
            borderRadius: 4,
            cursor: 'pointer',
          },
          ...riskyClauseStyles,
          ...(selectedClauseId && {
            [`[data-clause-id="${selectedClauseId}"]`]: {
              color: theme.palette.secondary.contrastText,
              backgroundColor: theme.palette.secondary.light,
              borderRadius: 4,
            },
          }),
          [`[data-clause-id="${selectedClauseId}"]:hover`]: {
            backgroundColor: theme.palette.secondary.light,
          },
        }}
      />
      <Scrollbar ref={leftScrollRef}>
        <Box
          sx={{
            padding: 3,
          }}
          onClick={handleClauseClick}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(qContractReview.data?.data?.processed_html ?? ''),
          }}
        />
      </Scrollbar>
    </Box>
  );

  const renderRightSection = (
    <Box
      sx={{
        flex: 2,
        height: '100vh',
        borderColor: 'divider',
      }}
    >
      <Column height={'100%'} position={'relative'}>
        <Box
          sx={{
            height: topSectionHeight,
            width: '100%',
            position: 'absolute',
            backgroundColor: 'background.default',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            top: 0,
          }}
        >
          <Typography variant="h5" sx={{ paddingX: 3, paddingY: 3 }}>
            Interpretation
          </Typography>
          <Box height={`${topSectionHeight} - 78px)`}>
            <Scrollbar>
              <Column
                sx={{
                  paddingX: 3,
                  paddingBottom: 2,
                }}
              >
                {isExplaining ? (
                  <Typography variant="body2">Analysing clause...</Typography>
                ) : (
                  <>
                    {explanation ? (
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                      >
                        {explanation}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        Click on a clause to get an explanation.
                      </Typography>
                    )}
                  </>
                )}
              </Column>
            </Scrollbar>
          </Box>
        </Box>

        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            marginTop: topSectionHeight,
            height: `calc(100vh - ${topSectionHeight} - 78px)`,
          }}
        >
          <Typography variant="h5" sx={{ paddingX: 3, paddingY: 3 }}>
            High Risk Clauses
          </Typography>
          <Scrollbar>
            <Column sx={{ paddingX: 3, paddingBottom: 2 }}>
              {qContractReview?.data?.data?.review?.risky_clauses?.length === 0 ? (
                <Typography variant="body2">No risky clauses found.</Typography>
              ) : (
                <List disablePadding dense>
                  {qContractReview.data?.data?.review?.risky_clauses?.map((clause) => (
                    <ListItem key={clause.key} disableGutters>
                      <Accordion
                        elevation={0}
                        disableGutters
                        expanded={selectedClauseId === clause.key}
                        onChange={(_event, expanded) => {
                          if (expanded) {
                            scrollToClause(clause.key);
                          } else {
                            setSelectedClauseId('');
                            setSelectedClauseContent('');
                            setExplanation('');
                          }
                        }}
                      >
                        <AccordionSummary
                          id={clause.key}
                          expandIcon={
                            <Iconify icon="bi:chevron-down" color={theme.palette.text.secondary} />
                          }
                        >
                          <Column gap={1}>
                            <Typography variant="body2" component="span" fontWeight={'bold'}>
                              Risky clause {clause.key?.split('-').pop()}{' '}
                            </Typography>
                            <Typography variant="body2">{clause.content}</Typography>
                          </Column>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Column gap={1}>
                            <Typography variant="body2">
                              <Typography variant="body2" component="span" fontWeight={'bold'}>
                                Concerns:{' '}
                              </Typography>
                              {clause.concerns}
                            </Typography>
                            <Typography variant="body2">
                              <Typography variant="body2" component="span" fontWeight={'bold'}>
                                Recommendations:{' '}
                              </Typography>
                              {clause.recommendations}
                            </Typography>
                            <Row justifyContent={'flex-start'}>
                              <Chip variant="outlined" label={`Risk level ${clause?.risk_level}`} />
                              <Chip variant="outlined" label={clause?.risk_type} />
                            </Row>
                          </Column>
                        </AccordionDetails>
                      </Accordion>
                    </ListItem>
                  ))}
                </List>
              )}
            </Column>

            {/* <Divider flexItem />

            <Column sx={{ paddingX: 3, paddingY: 3 }}>
              <Typography variant="h5">Summary Checklist</Typography>

              <ContractReviewChecklist
                text={qContractReview?.data?.data?.review?.summary_checklist ?? ''}
              />
            </Column> */}
          </Scrollbar>
        </Box>
      </Column>
    </Box>
  );

  return (
    <Column sx={{ height: '100vh' }}>
      {qContractReview.isLoading && <LoadingTopbar />}

      {qContractReview.isError && (
        <Typography color="error" sx={{ padding: 3 }}>
          An error occurred while fetching the contract review.
        </Typography>
      )}

      {qContractReview.isSuccess && (
        <Row gap={0}>
          {renderLeftSection}
          {renderRightSection}
        </Row>
      )}
    </Column>
  );
};

export default ContractReviewView;

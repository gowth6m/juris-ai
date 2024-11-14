// import Row from '@/components/core/row';
// import { useMutation } from 'react-query';
// import Iconify from '@/components/iconify';
// import { useState, useEffect } from 'react';
// import Column from '@/components/core/column';
// import ApiClient from '@/services/api-client';
// import CoreButton from '@/components/core/core-button';
// import { RiskyClause, RiskyClauseExplanationRequest } from '@/services/types/contract';

// import {
//   List,
//   Collapse,
//   ListItem,
//   Typography,
//   ListItemIcon,
//   ListItemText,
//   ListItemButton,
// } from '@mui/material';

// import UploadContractDialog from './upload-contract-dialog';
// import { useCurrentContractStore } from '../store/current-contract-store';

// // ----------------------------------------------------------------------

// type Props = {
//   contractId: string;
// };

// const HighRiskClauses: React.FC<Props> = ({ contractId }) => {
//   const [openClauseId, setOpenClauseId] = useState<string | null>(null); // Track which clause is open

//   const [open, setOpen] = useState(false);

//   const { riskyClauses } = useCurrentContractStore();

//   const handleToggle = (clauseId: string) => {
//     setOpenClauseId(openClauseId === clauseId ? null : clauseId); // Toggle clause open/close
//   };

//   const renderEmpty = (
//     <Row alignItems={'center'} justifyContent={'space-between'}>
//       <Typography>No risky clauses found</Typography>

//       <CoreButton size={'medium'} onClick={() => setOpen(true)}>
//         Review again
//       </CoreButton>

//       <UploadContractDialog
//         contractId={contractId}
//         open={open}
//         onClose={() => setOpen(false)}
//         action={undefined}
//       />
//     </Row>
//   );

//   const renderRiskyClauses = (
//     <List disablePadding>
//       {riskyClauses
//         .flatMap((flat) => flat.analysed_clauses)
//         .map((clause) => {
//           return (
//             <HighRiskClausesItem
//               key={clause.clause_id}
//               clause={clause}
//               contractId={contractId}
//               isOpen={openClauseId === clause.clause_id} // Pass whether the clause is open
//               onToggle={() => handleToggle(clause.clause_id)} // Handle toggle event
//             />
//           );
//         })}
//     </List>
//   );

//   return <Column>{riskyClauses.length === 0 ? renderEmpty : renderRiskyClauses}</Column>;
// };

// // ----------------------------------------------------------------------

// const HighRiskClausesItem = ({
//   clause,
//   contractId,
//   isOpen,
//   onToggle,
// }: {
//   clause: RiskyClause;
//   contractId: string;
//   isOpen: boolean;
//   onToggle: () => void;
// }) => {
//   const [currentExplaination, setCurrentExplaination] = useState<string>('');
//   const [typedExplanation, setTypedExplanation] = useState<string>(''); // For typing effect
//   const [isLoading, setIsLoading] = useState(false);
//   const [, setSelectedText] = useState<string>('');

//   const explainClauseMutation = useMutation<void, Error, RiskyClauseExplanationRequest>(
//     async (explanationRequest) => {
//       await ApiClient.contract.explainRiskyClause(explanationRequest, (chunk: string) => {
//         setCurrentExplaination((prevExplaination) =>
//           prevExplaination ? prevExplaination + chunk : chunk
//         );
//       });
//     },
//     {
//       onMutate: () => {
//         setCurrentExplaination('');
//         setIsLoading(true);
//       },
//       onSuccess: () => {
//         setIsLoading(false);
//       },
//       onError: (error) => {
//         console.error('Error explaining clause:', error.message);
//         setIsLoading(false);
//       },
//     }
//   );

//   // Typing animation effect
//   useEffect(() => {
//     if (!currentExplaination) return; // Safety check: don't start typing if the explanation is empty or undefined

//     let currentIndex = 0;
//     const words = currentExplaination.split(' '); // Split the explanation into words
//     setTypedExplanation(''); // Reset typed explanation on new text

//     const typingInterval = setInterval(() => {
//       if (currentIndex < words.length) {
//         setTypedExplanation((prev) => prev + words[currentIndex] + ' ');
//         currentIndex += 1;
//       } else {
//         clearInterval(typingInterval);
//       }
//     }, 25); // Adjust the speed by changing the interval time (100ms here)

//     return () => clearInterval(typingInterval); // Cleanup interval on unmount or when explanation changes
//   }, [currentExplaination]);

//   return (
//     <>
//       <ListItem
//         disableGutters
//         sx={{
//           borderRadius: 1,
//         }}
//       >
//         <ListItemButton
//           key={clause.clause_id}
//           onClick={() => {
//             onToggle(); // Call the toggle function
//             if (!isOpen) {
//               const elements = document.querySelectorAll(
//                 `li[data-list-text="${clause.clause_id}"]`
//               );

//               if (elements.length > 0) {
//                 elements[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
//               }

//               const text = elements?.[0]?.textContent ?? '';

//               setSelectedText(text);

//               explainClauseMutation.mutate({
//                 contract_id: contractId,
//                 risky_clause: {
//                   clause_id: clause.clause_id,
//                   risk_level: clause.risk_level,
//                   risk_factor: clause.risk_factor,
//                   title: clause.title,
//                   text: text,
//                 },
//               });
//             }
//           }}
//           sx={{
//             borderRadius: 1,
//           }}
//         >
//           <ListItemIcon>
//             <Iconify icon="mdi:alert-circle" />
//           </ListItemIcon>
//           <ListItemText primary={`${clause.title} ${clause.clause_id}`} />
//           {isOpen ? <Iconify icon="mdi:chevron-up" /> : <Iconify icon="mdi:chevron-down" />}
//         </ListItemButton>
//       </ListItem>
//       <Collapse in={isOpen} timeout="auto" unmountOnExit>
//         <List component="div" disablePadding>
//           <ListItemButton sx={{ pl: 4 }}>
//             <ListItemText
//               secondary={
//                 isLoading ? (
//                   <Typography variant="body1">Asking AI...</Typography>
//                 ) : (
//                   <Typography variant="body1">{typedExplanation}</Typography>
//                 )
//               }
//             />
//           </ListItemButton>
//         </List>
//       </Collapse>
//     </>
//   );
// };

// export default HighRiskClauses;

// import React from 'react';
// import parse, { domToReact } from 'html-react-parser';

// import { Box, Card, alpha, SxProps, Typography, CardContent } from '@mui/material';

// import { useCurrentContractStore } from '../store/current-contract-store';

// // ----------------------------------------------------------------------

// type Props = {
//   htmlAsString: string;
//   onClickOnText?: (text: string) => void;
//   sx?: SxProps;
// };

// const StringToHTMLDisplay: React.FC<Props> = ({ htmlAsString, onClickOnText, sx }) => {
//   const { currentClause } = useCurrentContractStore();

//   const options = {
//     replace: ({ name, attribs, children }: any) => {
//       if (!attribs) return;

//       // Extract inline styles from attribs.style that already exist
//       const inlineStyles = attribs.style ? styleStringToObject(attribs.style) : {};

//       // Helper function to extract text from children recursively
//       const extractText = (children: any): string => {
//         if (typeof children === 'string') {
//           return children;
//         }
//         if (Array.isArray(children)) {
//           return children
//             .map((child) => {
//               if (typeof child === 'string') {
//                 return child;
//               }
//               if (child?.data) {
//                 return child.data;
//               }
//               if (child.children) {
//                 return extractText(child.children);
//               }
//               return '';
//             })
//             .join('');
//         }
//         return '';
//       };

//       const handleClick = () => {
//         if (onClickOnText) {
//           const text = extractText(children);
//           onClickOnText(text.trim());
//         }
//       };

//       const isClicked = (children: any): boolean => {
//         const text = extractText(children).trim();
//         return currentClause?.text.trim() === text;
//       };

//       switch (name) {
//         case 'p':
//           return (
//             <Typography
//               variant="body1"
//               onClick={handleClick}
//               sx={{
//                 cursor: 'pointer',
//                 borderRadius: 0.5,
//                 backgroundColor: isClicked(children) ? 'secondary.light' : undefined,
//                 ':hover': {
//                   backgroundColor: 'secondary.lighter',
//                 },
//                 ...inlineStyles,
//               }}
//               component="p"
//             >
//               {domToReact(children, options)}
//             </Typography>
//           );
//         case 'ul':
//           return (
//             <Box
//               component="ul"
//               sx={{
//                 listStyleType: 'disc',
//                 paddingLeft: 4,
//                 marginBottom: 1,
//                 ...inlineStyles,
//               }}
//               {...attribs}
//             >
//               {domToReact(children, options)}
//             </Box>
//           );
//         case 'li':
//           return (
//             <Box
//               component="li"
//               sx={{
//                 marginLeft: 2,
//                 marginBottom: 1,
//                 ...inlineStyles,
//               }}
//               {...attribs}
//             >
//               {domToReact(children, options)}
//             </Box>
//           );
//         case 'h1':
//           return (
//             <Typography
//               variant="h6"
//               onClick={handleClick}
//               sx={{
//                 fontWeight: 'bold',
//                 marginTop: 1,
//                 marginBottom: 1,
//                 cursor: 'pointer',
//                 borderRadius: 0.5,
//                 backgroundColor: isClicked(children) ? 'secondary.light' : undefined,
//                 ':hover': {
//                   backgroundColor: 'secondary.lighter',
//                 },
//                 ...inlineStyles,
//               }}
//               component="h1"
//             >
//               {domToReact(children, options)}
//             </Typography>
//           );
//         case 'h2':
//           return (
//             <Typography
//               variant="subtitle1"
//               onClick={handleClick}
//               sx={{
//                 marginTop: 1,
//                 marginBottom: 1,
//                 cursor: 'pointer',
//                 borderRadius: 0.5,
//                 backgroundColor: isClicked(children) ? 'secondary.light' : undefined,
//                 ':hover': {
//                   backgroundColor: 'secondary.lighter',
//                 },
//                 ...inlineStyles,
//               }}
//               component="h2"
//             >
//               {domToReact(children, options)}
//             </Typography>
//           );
//         case 'span':
//           return (
//             <Typography
//               variant="body1"
//               onClick={handleClick}
//               sx={{
//                 cursor: 'pointer',
//                 borderRadius: 0.5,
//                 backgroundColor: isClicked(children) ? 'secondary.light' : undefined,
//                 ':hover': {
//                   backgroundColor: 'secondary.lighter',
//                 },
//                 ...inlineStyles,
//               }}
//               component="span"
//             >
//               {domToReact(children, options)}
//             </Typography>
//           );
//         case 'table':
//           return (
//             <Box
//               component="div"
//               sx={{
//                 overflowX: 'auto',
//               }}
//             >
//               <Box
//                 component="table"
//                 sx={{
//                   width: '100%',
//                   ...inlineStyles,
//                 }}
//               >
//                 {domToReact(children, options)}
//               </Box>
//             </Box>
//           );
//         default:
//           return;
//       }
//     },
//   };

//   return (
//     <Card
//       sx={{
//         p: 1,
//         border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
//         transition: (theme) => theme.transitions.create(['opacity', 'padding']),
//         ...sx,
//       }}
//     >
//       <CardContent
//         sx={{
//           '& *': {
//             backgroundColor: 'transparent',
//             color: 'text.primary',
//             margin: 'unset',
//             padding: 'unset',
//             textIndent: 'unset',
//           },
//         }}
//       >
//         {parse(removeInvalidTags(htmlAsString), options)}
//       </CardContent>
//     </Card>
//   );
// };

// // ----------------------------------------------------------------------

// // Utility function to remove <style> tags from HTML string
// const removeInvalidTags = (htmlString: string) => {
//   return htmlString
//     .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
//     .replace(/<\/?(html|head|body)[^>]*>/gi, '');
// };

// // Utility function to convert inline styles (from attribs.style) into an object
// const styleStringToObject = (styleString: string) => {
//   return styleString.split(';').reduce((acc: any, style: string) => {
//     const [key, value] = style.split(':');
//     if (key && value) {
//       const formattedKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
//       acc[formattedKey] = value.trim();
//     }
//     return acc;
//   }, {});
// };

// // ----------------------------------------------------------------------

// export default StringToHTMLDisplay;

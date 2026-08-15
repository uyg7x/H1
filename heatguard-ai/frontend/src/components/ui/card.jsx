import React from 'react';
import { Card as MuiCard, CardHeader as MuiCardHeader, CardContent as MuiCardContent, CardTitle as MuiCardTitle } from '@mui/material';

const Card = ({ children, className, ...props }) => (
  <MuiCard className={className} {...props}>
    {children}
  </MuiCard>
);

const CardHeader = ({ children, className, ...props }) => (
  <MuiCardHeader className={className} {...props}>
    {children}
  </MuiCardHeader>
);

const CardContent = ({ children, className, ...props }) => (
  <MuiCardContent className={className} {...props}>
    {children}
  </MuiCardContent>
);

const CardTitle = ({ children, className, ...props }) => (
  <MuiCardTitle className={className} {...props}>
    {children}
  </MuiCardTitle>
);

export { Card, CardHeader, CardContent, CardTitle };
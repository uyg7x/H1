import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ variant = 'contained', children, className, ...props }) => (
  <MuiButton variant={variant} className={className} {...props}>
    {children}
  </MuiButton>
);

export default Button;
import * as React from 'react';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import DeleteWarning from './DeleteAccount'

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function DeleteAccountStack() {
  return (
      <Stack
        direction="column"
        divider={<Divider orientation="horizontal" flexItem />}
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={2}
      >
        <span style={{color:'red', fontWeight: 700, fontSize: '2rem'}}>Delete account</span>
        <span>

            Once you delete your account, there is no going back. Please be certain.

            <DeleteWarning />
        </span>
      </Stack>
  );
}
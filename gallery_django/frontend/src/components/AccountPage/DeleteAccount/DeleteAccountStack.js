import * as React from 'react';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import DeleteWarning from './DeleteAccount'


export default function DeleteAccountStack( {csrf_token} ) {
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

            <DeleteWarning csrf_token={csrf_token} />
        </span>
      </Stack>
  );
}
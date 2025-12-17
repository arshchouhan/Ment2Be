 import React from 'react';
 import JournalPage from './JournalPage';
 
 export default function MentorJournalPage() {
   return (
     <JournalPage
       navbarVariant="mentor"
       redirectPath="/mentor/dashboard"
       defaultUserName="Mentor"
     />
   );
 }

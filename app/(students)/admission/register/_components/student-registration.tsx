'use client'
import { useQuery } from "@tanstack/react-query"
import { getEnrolledStudent } from "../query/get-enrolled-student"
import { PersonalDetailsForm } from "./personal-details-form"
import { PreviousAcademicDetailsForm } from "./previous-academic-details-form"
import { DocumentsUploadForm } from "./documents-upload-form"


// In this page student fill the registration form in 3 steps (personal details, previous academic, documents upload)
export const StudentRegistration = ({ UAN, batch }: { UAN: string, batch: string }) => {

  const { data, isLoading, error } = useQuery(getEnrolledStudent({ UAN, batch }))

  return (
    <>
    {/* Personal Details Form  */}
    <PersonalDetailsForm />
    
    {/* Previous Acedamic Details Form  */}
    <PreviousAcademicDetailsForm />
    
    {/* Documents Upload Form */}
    <DocumentsUploadForm />



    </>
  )
}
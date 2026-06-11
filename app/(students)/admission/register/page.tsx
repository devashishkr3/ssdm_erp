import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getEnrolledStudent } from "./query/get-enrolled-student";
import { StudentRegistration } from "./_components/student-registration";
import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";

// Define the props interface where searchParams is a Promise
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterStudents({ searchParams }: PageProps) {
  // Await the searchParams promise to extract the parameters
  const resolvedParams = await searchParams;
  const batch = resolvedParams.batch as string;
  const UAN = resolvedParams.uan as string; // Assuming UAN also comes from the query
  const MJC = resolvedParams.mjc as string;

  const queryClient = new QueryClient();
  const config = getCollegeConfig();

  await queryClient.prefetchQuery(getEnrolledStudent({ batch, UAN, MJC }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <HydrationBoundary state={dehydrate(queryClient)}>
            {/* <Register /> */}
            <StudentRegistration />
          </HydrationBoundary>
        </div>
      </main>
      <SiteFooter config={config} />
    </div>
  );
}

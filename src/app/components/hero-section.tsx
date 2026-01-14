"use client";

import { Button } from "@/components/ui/button";

const title = `
 █████╗  █████╗   ███████╗ █████╗ ██████╗  ██████╗ ███████╗
██╔══██╗██╔══██╗  ██╔════╝██╔══██╗██╔══██╗██╔════╝ ██╔════╝
██║  ██║██║  ╚═╝  █████╗  ██║  ██║██████╔╝██║  ██╗ █████╗  
██║  ██║██║  ██╗  ██╔══╝  ██║  ██║██╔══██╗██║  ╚██╗██╔══╝  
╚█████╔╝╚█████╔╝  ██║     ╚█████╔╝██║  ██║╚██████╔╝███████╗
 ╚════╝  ╚════╝   ╚═╝      ╚════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
`;

const asciiForge = `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%   %%        %%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%               %%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%          %%               %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%            %%             %%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%              %%%             %%%%%%%%%%%%%%%
%%%%%%%%%%%%     %%%%%%%%%%%%  %%%    %%       %%%%%%%%%%%%
%%%%%%%%%%     %%%%%%%%%%%%%%%%  %%%%%%%%%       %%%%%%%%%%
%%%%%%%%%%     %%%%%%%%%%%%%%%%%%   %%%%%%%%       %%%%%%%%
%%%%%%%%%%     %%%%%%%%%%%%%%%%%%   %%%%%%%%%%       %%%%%%
%%%%%%%%%%     %%%%%%%%%%%%%%%%%%   %%%%%%%%%%%      %%%%%%
%%%%%%%%%%     %%%%%%%%%%%%%%%%%%   %%%%%%%%%%%%%  %%%%%%%%
%%%%%%%%%%     %%%%%%%%%%%%%%                  %%%%%%%%%%%%
%%%%%%%%%%     %%                              %%%%%%%%%%%%
%%%%%%%%%%     %%%%                       %%%%%%%%%%%%%%%%%
%%%%%%%%%%     %%%%%%%%                 %%%%%%%%%%%%%%%%%%%
%%%%%%%%             %%%%%%           %%%%%%%%%%%%%%%%%%%%%
%%%%%%%%                 %%           %%%%%%%%%%%%%%%%%%%%%
%%%%%%%%                                %%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%                   %%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%                       %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
`;

const opencodeGithubLink = "https://github.com/anomalyco/opencode";

export default function HeroSection() {
  const handleScrollToConfig = () => {
    const configSection = document.getElementById("config-section");
    if (configSection) {
      window.scrollTo({
        top: configSection.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center pb-16">
      <div className="flex flex-col items-center px-6">
        <div className="max-w-2xl text-center mb-8">
          <h1>
            <pre className="font-mono text-[12px] leading-none whitespace-pre select-none mb-4">
              <code>{title}</code>
            </pre>
            <pre className="leading-tight text-[6px]">
              <code>{asciiForge}</code>
            </pre>
          </h1>

          <h2 className="mb-6">
            Config Builder for{" "}
            <span className="underline">
              <a href={opencodeGithubLink}>opencode</a>
            </span>
          </h2>
          <Button onClick={handleScrollToConfig}>Create Config</Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
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
  return (
    <section className="flex flex-col items-center justify-center text-center mt-4">
      <div className="flex flex-col items-center px-6">
        <div className="max-w-2xl text-center mb-8">
          <div>
            <pre className="font-mono text-[12px] leading-none whitespace-pre select-none mb-4">
              <code>{title}</code>
            </pre>
            <pre className="leading-tight text-[6px]">
              <code>{asciiForge}</code>
            </pre>
          </div>

          <h2 className="my-2 mb-4">
            Config Builder for{" "}
            <span className="underline">
              <a
                href={opencodeGithubLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                opencode
              </a>
            </span>
          </h2>
          <Link href="/config-editor" prefetch={true}>
            <Button>Open Config Editor</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

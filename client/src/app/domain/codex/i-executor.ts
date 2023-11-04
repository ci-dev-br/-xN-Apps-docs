import { Type } from "@angular/compiler";
import { AgentService } from "./agent.service";

export interface IExcutorAgentMetadata {
    name: string;
    agentService?: AgentService;
}
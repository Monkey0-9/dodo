from typing import TYPE_CHECKING

from dodo.agents.base_agent_v2 import BaseAgentV2
from dodo.agents.dodo_agent_v2 import dodoAgentV2
from dodo.agents.dodo_agent_v3 import dodoAgentV3
from dodo.groups.sleeptime_multi_agent_v3 import SleeptimeMultiAgentV3
from dodo.groups.sleeptime_multi_agent_v4 import SleeptimeMultiAgentV4
from dodo.schemas.agent import AgentState
from dodo.schemas.enums import AgentType

if TYPE_CHECKING:
    from dodo.orm import User


class AgentLoop:
    """Factory class for instantiating the agent execution loop based on agent type"""

    @staticmethod
    def load(agent_state: AgentState, actor: "User") -> BaseAgentV2:
        if agent_state.agent_type in [AgentType.dodo_v1_agent, AgentType.sleeptime_agent]:
            if agent_state.enable_sleeptime:
                if agent_state.multi_agent_group is None:
                    # Agent has sleeptime enabled but no group - fall back to non-sleeptime agent
                    from dodo.log import get_logger

                    logger = get_logger(__name__)
                    logger.warning(
                        f"Agent {agent_state.id} has enable_sleeptime=True but multi_agent_group is None. "
                        f"Falling back to standard dodoAgentV3."
                    )
                    return dodoAgentV3(
                        agent_state=agent_state,
                        actor=actor,
                    )
                return SleeptimeMultiAgentV4(
                    agent_state=agent_state,
                    actor=actor,
                    group=agent_state.multi_agent_group,
                )
            return dodoAgentV3(
                agent_state=agent_state,
                actor=actor,
            )
        elif agent_state.enable_sleeptime and agent_state.agent_type != AgentType.voice_convo_agent:
            if agent_state.multi_agent_group is None:
                # Agent has sleeptime enabled but no group - fall back to non-sleeptime agent
                from dodo.log import get_logger

                logger = get_logger(__name__)
                logger.warning(
                    f"Agent {agent_state.id} has enable_sleeptime=True but multi_agent_group is None. "
                    f"Falling back to standard dodoAgentV2."
                )
                return dodoAgentV2(
                    agent_state=agent_state,
                    actor=actor,
                )
            return SleeptimeMultiAgentV3(agent_state=agent_state, actor=actor, group=agent_state.multi_agent_group)
        else:
            return dodoAgentV2(
                agent_state=agent_state,
                actor=actor,
            )


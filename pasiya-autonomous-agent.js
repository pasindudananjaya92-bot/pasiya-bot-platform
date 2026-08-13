async function runAutonomousAgent() {
    const inputElement = document.getElementById('inp');
    if (!inputElement) return;

    const userPrompt = inputElement.value.trim();
    if (!userPrompt) {
        if (typeof showModal === 'function') {
            showModal('NOTICE', 'Please type a prompt or task first.');
        }
        return;
    }

    inputElement.value = '';

    if (typeof add === 'function') {
        add('user', userPrompt);
    }

    const keyElem = document.getElementById('apiKey');
    const key = keyElem ? keyElem.value.trim() : '';

    if (!key) {
        if (typeof add === 'function') {
            add('sys', '⚠️ ERROR: Groq API Key is missing in Settings. Please add your free key to run agent loops.');
        }
        return;
    }

    if (typeof add === 'function') {
        add('bot', '🤖 Pasiya Max Agent initialized. Breaking down task into steps...');
    }

    try {
        const planningPrompt = `Break down this task into 3 clear sequential steps: "${userPrompt}". Reply strictly with the steps separated by numbers.`;

        let planResult = '';
        if (typeof groq === 'function') {
            planResult = await groq(key, 'You are an autonomous AI planner agent.', planningPrompt);
        } else {
            throw new Error('Groq function not available.');
        }

        if (typeof add === 'function') {
            add('bot', `📋 **Agent Plan:**\n${planResult}`);
            add('bot', '⚙️ Executing steps sequentially...');
        }

        let currentContext = `Goal: ${userPrompt}\nPlan: ${planResult}`;

        for (let i = 1; i <= 3; i++) {
            const stepExecutionPrompt = `Based on the plan, execute Step ${i} for the context: "${currentContext}". Provide the precise result for this step.`;

            let stepOutput = '';
            if (typeof groq === 'function') {
                stepOutput = await groq(key, 'You are an execution agent carrying out tasks step-by-step.', stepExecutionPrompt);
            }

            if (typeof add === 'function') {
                add('bot', `✅ **Step ${i} Output:**\n${stepOutput}`);
            }

            currentContext = stepOutput;
        }

        if (typeof add === 'function') {
            add('sys', '🎉 Autonomous agent workflow completed successfully!');
        }

    } catch (error) {
        console.error('Agent Execution Error:', error);
        if (typeof add === 'function') {
            add('sys', `❌ Agent Error: ${error.message || 'Execution failed.'}`);
        }
    }
}

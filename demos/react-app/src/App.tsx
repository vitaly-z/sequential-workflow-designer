import { useEffect, useState } from 'react';
import { Definition, ObjectCloner, Step, StepsConfiguration, ToolboxConfiguration } from 'sequential-workflow-designer';
import { SequentialWorkflowDesigner, wrapDefinition } from 'sequential-workflow-designer-react';
import { GlobalEditor } from './GlobalEditor';
import { StepEditor } from './StepEditor';
import { createSwitchStep, createTaskStep } from './StepUtils';

const startDefinition: Definition = {
	properties: {},
	sequence: [createTaskStep(), createSwitchStep()]
};

const toolboxConfiguration: ToolboxConfiguration = {
	groups: [{ name: 'Steps', steps: [createTaskStep(), createSwitchStep()] }]
};

const stepsConfiguration: StepsConfiguration = {
	validator: (step: Step) => !!step.name
};

export function App() {
	const [isVisible, setIsVisible] = useState(true);
	const [definition, setDefinition] = useState(() => wrapDefinition(startDefinition));
	const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
	const [isReadonly, setIsReadonly] = useState(false);
	const definitionJson = JSON.stringify(definition.value, null, 2);

	useEffect(() => {
		console.log(`definition updated, isValid=${definition.isValid}`);
	}, [definition]);

	function toggleVisibilityClicked() {
		setIsVisible(!isVisible);
	}

	function toggleSelectionClicked() {
		const id = definition.value.sequence[0].id;
		setSelectedStepId(selectedStepId ? null : id);
	}

	function toggleIsReadonlyClicked() {
		setIsReadonly(!isReadonly);
	}

	function reloadDefinitionClicked() {
		const newDefinition = ObjectCloner.deepClone(startDefinition);
		setDefinition(wrapDefinition(newDefinition));
	}

	return (
		<>
			{isVisible && (
				<SequentialWorkflowDesigner
					undoStackSize={10}
					definition={definition}
					onDefinitionChange={setDefinition}
					selectedStepId={selectedStepId}
					isReadonly={isReadonly}
					onSelectedStepIdChanged={setSelectedStepId}
					toolboxConfiguration={toolboxConfiguration}
					stepsConfiguration={stepsConfiguration}
					globalEditor={<GlobalEditor />}
					stepEditor={<StepEditor />}
				/>
			)}

			<ul>
				<li>Definition: {definitionJson.length} bytes</li>
				<li>Selected step: {selectedStepId}</li>
				<li>Is readonly: {isReadonly ? '✅ Yes' : 'No'}</li>
				<li>Is valid: {definition.isValid === undefined ? '?' : definition.isValid ? '✅ Yes' : '⛔ No'}</li>
			</ul>

			<div>
				<button onClick={toggleVisibilityClicked}>Toggle visibility</button>
				<button onClick={reloadDefinitionClicked}>Reload definition</button>
				<button onClick={toggleSelectionClicked}>Toggle selection</button>
				<button onClick={toggleIsReadonlyClicked}>Toggle readonly</button>
			</div>

			<div>
				<textarea value={definitionJson} readOnly={true} cols={100} rows={15} />
			</div>
		</>
	);
}

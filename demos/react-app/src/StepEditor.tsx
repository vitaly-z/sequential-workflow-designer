import { ChangeEvent } from 'react';
import { SwitchStep } from 'sequential-workflow-designer';
import { useStepEditor } from 'sequential-workflow-designer-react';

export function StepEditor() {
	const { type, name, step, properties, setName, setProperty, notifyPropertiesChanged, notifyChildrenChanged } = useStepEditor();

	function onNameChanged(e: ChangeEvent) {
		setName((e.target as HTMLInputElement).value);
	}

	function onXChanged(e: ChangeEvent) {
		setProperty('x', (e.target as HTMLInputElement).value);
	}

	function onYChanged(e: ChangeEvent) {
		properties['y'] = (e.target as HTMLInputElement).value;
		notifyPropertiesChanged();
	}

	function toggleExtraBranch() {
		const switchStep = step as SwitchStep;
		if (switchStep.branches['extra']) {
			delete switchStep.branches['extra'];
		} else {
			switchStep.branches['extra'] = [];
		}
		notifyChildrenChanged();
	}

	return (
		<>
			<h2>Step Editor {type}</h2>

			<h4>Name</h4>
			<input type="text" value={name} onChange={onNameChanged} />

			<h4>X Variable</h4>
			<input type="text" value={(properties['x'] as string) || ''} onChange={onXChanged} />

			<h4>Y Variable</h4>
			<input type="text" value={(properties['y'] as string) || ''} onChange={onYChanged} />

			{type === 'switch' && (
				<>
					<h4>Extra branch</h4>
					<button onClick={toggleExtraBranch}>Toggle branch</button>
				</>
			)}
		</>
	);
}

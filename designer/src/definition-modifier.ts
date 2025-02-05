import { SequenceModifier } from './core/sequence-modifier';
import { StepsTraverser } from './core/steps-traverser';
import { Definition, Sequence, Step } from './definition';
import { DesignerConfiguration } from './designer-configuration';
import { DefinitionChangeType, DesignerState } from './designer-state';

export class DefinitionModifier {
	public constructor(
		private readonly stepsTraverser: StepsTraverser,
		private readonly state: DesignerState,
		private readonly configuration: DesignerConfiguration
	) {}

	public tryDelete(stepId: string): boolean {
		const result = this.stepsTraverser.getParentSequence(this.state.definition, stepId);

		const canDeleteStep = this.configuration.steps.canDeleteStep
			? this.configuration.steps.canDeleteStep(result.step, result.parentSequence)
			: true;
		if (!canDeleteStep) {
			return false;
		}

		SequenceModifier.deleteStep(result.step, result.parentSequence);
		this.state.notifyDefinitionChanged(DefinitionChangeType.stepDeleted, result.step.id);

		this.updateDependantFields();
		return true;
	}

	public tryInsert(step: Step, targetSequence: Sequence, targetIndex: number): boolean {
		const canInsertStep = this.configuration.steps.canInsertStep
			? this.configuration.steps.canInsertStep(step, targetSequence, targetIndex)
			: true;
		if (!canInsertStep) {
			return false;
		}

		SequenceModifier.insertStep(step, targetSequence, targetIndex);
		this.state.notifyDefinitionChanged(DefinitionChangeType.stepInserted, step.id);
		this.state.setSelectedStepId(step.id);
		return true;
	}

	public tryMove(sourceSequence: Sequence, step: Step, targetSequence: Sequence, targetIndex: number): boolean {
		const canMoveStep = this.configuration.steps.canMoveStep
			? this.configuration.steps.canMoveStep(sourceSequence, step, targetSequence, targetIndex)
			: true;
		if (!canMoveStep) {
			return false;
		}

		SequenceModifier.moveStep(sourceSequence, step, targetSequence, targetIndex);
		this.state.notifyDefinitionChanged(DefinitionChangeType.stepMoved, step.id);
		this.state.setSelectedStepId(step.id);
		return true;
	}

	public replaceDefinition(definition: Definition) {
		if (!definition) {
			throw new Error('Definition is empty');
		}

		this.state.setDefinition(definition);
		this.updateDependantFields();
	}

	public updateDependantFields() {
		if (this.state.selectedStepId) {
			const found = this.stepsTraverser.findById(this.state.definition, this.state.selectedStepId);
			if (!found) {
				// We need to unselect step when it's deleted.
				this.state.setSelectedStepId(null);
			}
		}

		for (let index = 0; index < this.state.folderPath.length; index++) {
			const stepId = this.state.folderPath[index];
			const found = this.stepsTraverser.findById(this.state.definition, stepId);
			if (!found) {
				// We need to update path if any folder is deleted.
				const newPath = this.state.folderPath.slice(0, index);
				this.state.setFolderPath(newPath);
				break;
			}
		}
	}
}

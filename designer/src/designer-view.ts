import { ControlBar } from './control-bar/control-bar';
import { Dom } from './core/dom';
import { DesignerConfiguration } from './designer-configuration';
import { DesignerContext } from './designer-context';
import { LayoutController } from './layout-controller';
import { PathBar } from './path-bar/path-bar';
import { SmartEditor } from './smart-editor/smart-editor';
import { Toolbox } from './toolbox/toolbox';
import { ComponentContext } from './workspace/component-context';
import { Workspace } from './workspace/workspace';

export class DesignerView {
	public static create(
		parent: HTMLElement,
		designerContext: DesignerContext,
		componentContext: ComponentContext,
		layoutController: LayoutController,
		configuration: DesignerConfiguration
	): DesignerView {
		const theme = configuration.theme || 'light';

		const root = Dom.element('div', {
			class: `sqd-designer sqd-theme-${theme}`
		});
		parent.appendChild(root);

		const workspace = Workspace.create(root, designerContext, componentContext);
		let toolbox: Toolbox | undefined = undefined;

		if (!configuration.toolbox.isHidden) {
			toolbox = Toolbox.create(root, designerContext, componentContext);
		}
		ControlBar.create(root, designerContext);
		PathBar.create(root, designerContext);
		if (!configuration.editors.isHidden) {
			SmartEditor.create(root, designerContext);
		}
		const view = new DesignerView(root, layoutController, workspace, toolbox);
		view.reloadLayout();
		window.addEventListener('resize', view.onResizeHandler, false);
		return view;
	}

	private readonly onResizeHandler = () => this.onResize();
	private readonly onKeyUpHandlers: KeyUpHandler[] = [];

	public constructor(
		private readonly root: HTMLElement,
		private readonly layoutController: LayoutController,
		public readonly workspace: Workspace,
		private readonly toolbox?: Toolbox
	) {}

	public bindKeyUp(handler: KeyUpHandler) {
		document.addEventListener('keyup', handler, false);
		this.onKeyUpHandlers.push(handler);
	}

	public destroy() {
		window.removeEventListener('resize', this.onResizeHandler, false);
		this.onKeyUpHandlers.forEach(h => document.removeEventListener('keyup', h, false));

		this.workspace.destroy();
		this.toolbox?.destroy();

		this.root.parentElement?.removeChild(this.root);
	}

	private onResize() {
		this.reloadLayout();
	}

	private reloadLayout() {
		const isMobile = this.layoutController.isMobile();
		Dom.toggleClass(this.root, !isMobile, 'sqd-layout-desktop');
		Dom.toggleClass(this.root, isMobile, 'sqd-layout-mobile');
	}
}

export type KeyUpHandler = (e: KeyboardEvent) => void;

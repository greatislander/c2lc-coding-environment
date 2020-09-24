// @flow

import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount, shallow } from 'enzyme';
import { Button } from 'react-bootstrap';
import { createIntl, IntlProvider } from 'react-intl';
import AudioManager from './AudioManager';
import ActionPanel from './ActionPanel';
import AriaDisablingButton from './AriaDisablingButton';
import FocusTrapManager from './FocusTrapManager';
import messages from './messages.json';
import ProgramBlockEditor from './ProgramBlockEditor';
import ToggleSwitch from './ToggleSwitch';

// Mocks
jest.mock('./AudioManager');

configure({ adapter: new Adapter()});

// TODO: Mock the FocusTrapManager

const defaultProgramBlockEditorProps = {
    program: ['forward', 'left', 'forward', 'left'],
    interpreterIsRunning: false,
    activeProgramStepNum: null,
    actionPanelStepIndex: null,
    selectedAction: null,
    editingDisabled: false,
    replaceIsActive: false,
    runButtonDisabled: false,
    isDraggingCommand: false,
    focusTrapManager: new FocusTrapManager()
};

function createShallowProgramBlockEditor(props) {
    const intl = createIntl({
        locale: 'en',
        defaultLocale: 'en',
        messages: messages.en
    });

    // $FlowFixMe: Flow doesn't know about the Jest mock API
    AudioManager.mockClear();
    const audioManagerInstance = new AudioManager(true);
    // $FlowFixMe: Flow doesn't know about the Jest mock API
    const audioManagerMock: any = AudioManager.mock.instances[0];

    const mockClickRunButtonHandler = jest.fn();
    const mockChangeProgramHandler = jest.fn();

    const wrapper: $FlowIgnoreType = shallow(
        React.createElement(
            ProgramBlockEditor.WrappedComponent,
            Object.assign(
                {},
                defaultProgramBlockEditorProps,
                {
                    intl: intl,
                    audioManager: audioManagerInstance,
                    onClickRunButton: mockClickRunButtonHandler,
                    onChangeProgram: mockChangeProgramHandler
                },
                props
            )
        )
    );

    return {
        wrapper,
        audioManagerMock,
        mockClickRunButtonHandler,
        mockChangeProgramHandler
    };
}

function createMountProgramBlockEditor(props) {
    // $FlowFixMe: Flow doesn't know about the Jest mock API
    AudioManager.mockClear();
    const audioManagerInstance = new AudioManager(true);
    // $FlowFixMe: Flow doesn't know about the Jest mock API
    const audioManagerMock = AudioManager.mock.instances[0];

    const mockClickRunButtonHandler = jest.fn();
    const mockChangeProgramHandler = jest.fn();
    const mockChangeActionPanelStepIndex = jest.fn();

    const wrapper = mount(
        React.createElement(
            ProgramBlockEditor,
            Object.assign(
                {},
                defaultProgramBlockEditorProps,
                {
                    audioManager: audioManagerInstance,
                    onClickRunButton: mockClickRunButtonHandler,
                    onChangeProgram: mockChangeProgramHandler,
                    onChangeActionPanelStepIndex: mockChangeActionPanelStepIndex
                },
                props
            )
        ),
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale: 'en',
                defaultLocale: 'en',
                messages: messages.en
            }
        }
    );

    return {
        wrapper,
        audioManagerMock,
        mockClickRunButtonHandler,
        mockChangeProgramHandler,
        mockChangeActionPanelStepIndex
    };
}

function getProgramDeleteAllButton(programBlockEditorWrapper) {
    return programBlockEditorWrapper.find(AriaDisablingButton)
        .filter('.ProgramBlockEditor__program-deleteAll-button');
}

function getProgramBlockWithActionPanel(programBlockEditorWrapper) {
    return programBlockEditorWrapper.find('div')
        .filter('.ProgramBlockEditor__program-block-with-panel');
}

function getActionPanelActionButtons(programBlockEditorWrapper) {
    return programBlockEditorWrapper.find(Button)
        .filter('.ActionPanel__action-buttons');
}

function getProgramBlocks(programBlockEditorWrapper) {
    return programBlockEditorWrapper.find(AriaDisablingButton)
        .filter('.ProgramBlockEditor__program-block');
}

function getProgramBlockAtPosition(programBlockEditorWrapper, index: number) {
    return getProgramBlocks(programBlockEditorWrapper).at(index);
}

function getRunButton(programBlockEditorWrapper) {
    return programBlockEditorWrapper.find(AriaDisablingButton)
        .filter('.ProgramBlockEditor__run-button');
}

function getAddNodeButtonAtPosition(programBlockEditorWrapper, index: number) {
    const addNodeButton = programBlockEditorWrapper.find(AriaDisablingButton).filter('.AddNode__expanded-button');
    return addNodeButton.at(index);
}

function getEnabledAddNodeCount(programBlockEditorWrapper) {
    const addNodeButton = programBlockEditorWrapper.find(AriaDisablingButton).filter('.AddNode__expanded-button');
    return addNodeButton.length;
}

function getAddNodeExpandButton(programBlockEditorWrapper) {
    const addNodeButton = programBlockEditorWrapper.find(ToggleSwitch).filter('.ProgramBlockEditor__add-node-toggle-switch');
    return addNodeButton.at(0);
}

describe('Program rendering', () => {
    test('Blocks should be rendered for the test program', () => {
        expect.assertions(5);
        const { wrapper } = createMountProgramBlockEditor();
        expect(getProgramBlocks(wrapper).length).toBe(4);
        expect(getProgramBlocks(wrapper).at(0).prop('data-command')).toBe('forward');
        expect(getProgramBlocks(wrapper).at(1).prop('data-command')).toBe('left');
        expect(getProgramBlocks(wrapper).at(2).prop('data-command')).toBe('forward');
        expect(getProgramBlocks(wrapper).at(3).prop('data-command')).toBe('left');
    });
});

test('When a step is clicked, action panel should render next to the step', () => {
    expect.assertions(12);
    for (let stepNum = 0; stepNum < 4; stepNum++) {
        const { wrapper, mockChangeActionPanelStepIndex } = createMountProgramBlockEditor();
        const programBlock = getProgramBlockAtPosition(wrapper, stepNum);
        programBlock.simulate('click');
        expect(mockChangeActionPanelStepIndex.mock.calls.length).toBe(1);
        const actionPanelStepIndex = mockChangeActionPanelStepIndex.mock.calls[0][0];
        expect(actionPanelStepIndex).toBe(stepNum);
        wrapper.setProps({actionPanelStepIndex});
        const actionPanelContainer = getProgramBlockWithActionPanel(wrapper).at(stepNum).childAt(1);
        // $FlowFixMe: The flow-typed definitions for enzyme introduce a type-checking error here.
        expect(actionPanelContainer.contains(ActionPanel)).toBe(true);
    }
});


describe("Expand button and add nodes", () => {
    test("The expand button should work when there are no program blocks.", () => {
        expect.assertions(2);
    
        const { wrapper } = createMountProgramBlockEditor({
            program: []
        });
    
        expect(getEnabledAddNodeCount(wrapper)).toBe(1);
    
        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');
    
        expect(getEnabledAddNodeCount(wrapper)).toBe(1);
    });

    test("The expand button should work when there is one program block.", () => {
        expect.assertions(2);
    
        const { wrapper } = createMountProgramBlockEditor({
            program: ['right'],
            selectedAction: 'left'
        });
    
        expect(getEnabledAddNodeCount(wrapper)).toBe(1);
    
        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');
    
        expect(getEnabledAddNodeCount(wrapper)).toBe(2);
    });

    test("The expand button should work when there are two program blocks.", () => {
        expect.assertions(2);
    
        const { wrapper } = createMountProgramBlockEditor({
            program: ['forward', 'right'],
            selectedAction: 'left'
        });
    
        expect(getEnabledAddNodeCount(wrapper)).toBe(1);
    
        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');
    
        expect(getEnabledAddNodeCount(wrapper)).toBe(3);
    });

    test("All aria labels for add buttons should be correct when no action is selected.", () => {
        expect.assertions(3);
    
        const { wrapper } = createMountProgramBlockEditor({
            program: ['forward', 'right']
        });
        
        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');
        
        const leadingAddButton  = getAddNodeButtonAtPosition(wrapper, 0);
        const middleAddButton   = getAddNodeButtonAtPosition(wrapper, 1);
        const trailingAddButton = getAddNodeButtonAtPosition(wrapper, 2);
        
        [leadingAddButton, middleAddButton, trailingAddButton].forEach((button)=> {
            const ariaLabel = button.getDOMNode().getAttribute('aria-label');
            expect(ariaLabel).toBe("Make sure an action is selected");
        });
    });

    test("All aria labels for add buttons should be correct when an action is selected.", () => {
        expect.assertions(3);
    
        const { wrapper } = createMountProgramBlockEditor({
            program: ['forward', 'right'],
            selectedAction: 'left'
        });
        
        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');
        
        const leadingAddButton  = getAddNodeButtonAtPosition(wrapper, 0);
        const middleAddButton   = getAddNodeButtonAtPosition(wrapper, 1);
        const trailingAddButton = getAddNodeButtonAtPosition(wrapper, 2);
        
        // Add to the begining when an action is selected
        const addAtBeginningLabel = leadingAddButton.getDOMNode().getAttribute('aria-label');
        expect(addAtBeginningLabel).toBe("Add selected action left to the beginning of the program");

        // Add in the middle when an action is selected
        const addAtMiddleLabel = middleAddButton.getDOMNode().getAttribute('aria-label');
        expect(addAtMiddleLabel).toBe("Add selected action left between position 1, forward and position 2, right");

        // Add to the end when an action is selected
        const addAtEndLabel = trailingAddButton.getDOMNode().getAttribute('aria-label');
        expect(addAtEndLabel).toBe("Add selected action left to the end of the program");
    });
});


describe('Delete All button', () => {
    test('When the Delete All button is clicked, then the dialog shoud be shown', () => {
        expect.assertions(4);

        const { wrapper, audioManagerMock } = createShallowProgramBlockEditor();

        // Initially, check that the modal is not showing
        expect(wrapper.state().showConfirmDeleteAll).toBe(false);
        // When the Delete All button is clicked
        const deleteAllButton = getProgramDeleteAllButton(wrapper).at(0);
        deleteAllButton.simulate('click');
        // Then the 'deleteAll' sound should be played
        expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
        expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('deleteAll');
        // And the dialog should be shown
        expect(wrapper.state().showConfirmDeleteAll).toBe(true);
    });
});

describe("Add program steps", () => {
    test('We should be able to add a step at the end of the program', () => {
        expect.assertions(4);
    
        // Given a program of 5 forwards and 'left' as the selected command
        const { wrapper, audioManagerMock, mockChangeProgramHandler } = createMountProgramBlockEditor({
            program: ['forward', 'forward', 'forward', 'forward', 'forward'],
            selectedAction: 'left'
        });
    
        // When 'left' is added to the end of the program
        // (The index is zero because the add nodes aren't expanded).
        const addNode = getAddNodeButtonAtPosition(wrapper, 0);
        addNode.simulate('click');
    
        // Then the 'add' sound should be played
        expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
        expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('add');
    
        // And the program should be changed
        expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
        expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(
            ['forward', 'forward', 'forward', 'forward', 'forward', 'left']);
    });

    test('We should be able to add a step at the beginning of the program', () => {
        expect.assertions(4);

        // Given a program of 5 forwards and 'left' as the selected command
        const { wrapper, audioManagerMock, mockChangeProgramHandler } = createMountProgramBlockEditor({
            program: ['forward', 'forward', 'forward', 'forward', 'forward'],
            selectedAction: 'left'
        });

        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');

        // When 'left' is added to the beginning of the program
        const addNode = getAddNodeButtonAtPosition(wrapper, 0);
        addNode.simulate('click');
    
        // Then the 'add' sound should be played
        expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
        expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('add');
    
        // And the program should be changed
        expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
        expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(
            ['left', 'forward', 'forward', 'forward', 'forward', 'forward']);
    });

    test('We should be able to add a step in the middle of the program', () => {
        expect.assertions(4);
    
        // Given a program of 5 forwards and 'left' as the selected command
        const { wrapper, audioManagerMock, mockChangeProgramHandler } = createMountProgramBlockEditor({
            program: ['forward', 'forward', 'forward', 'forward', 'forward'],
            selectedAction: 'left'
        });
    
        const expandNode = getAddNodeExpandButton(wrapper);
        expandNode.simulate('click');

        // When 'left' is added to the middle of the program
        const addNode = getAddNodeButtonAtPosition(wrapper, 3);
        addNode.simulate('click');
    
        // Then the 'add' sound should be played
        expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
        expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('add');
    
        // And the program should be changed
        expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
        expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(
            ['forward', 'forward', 'forward', "left", 'forward', 'forward']);
    });
});


describe('Delete program steps', () => {
    test.each([
        [ 0, ['left', 'forward', 'left']],
        [ 3, ['forward', 'left', 'forward']]
    ])('While the action panel is open, when block %i is clicked, then program should be updated',
        (stepNum, expectedProgram) => {
            const { wrapper, audioManagerMock, mockChangeProgramHandler, mockChangeActionPanelStepIndex } = createMountProgramBlockEditor();
            const programBlock = getProgramBlockAtPosition(wrapper, stepNum);
            programBlock.simulate('click');

            // ActionPanel should be rendered on click of a program block
            expect(mockChangeActionPanelStepIndex.mock.calls.length).toBe(1);
            const actionPanelStepIndex = mockChangeActionPanelStepIndex.mock.calls[0][0];
            expect(actionPanelStepIndex).toBe(stepNum);
            wrapper.setProps({actionPanelStepIndex});
            const actionPanelContainer = getProgramBlockWithActionPanel(wrapper).at(stepNum).childAt(1);
            // $FlowFixMe: The flow-typed definitions for enzyme introduce a type-checking error here.
            expect(actionPanelContainer.containsMatchingElement(ActionPanel)).toBe(true);

            const deleteStepButton = getActionPanelActionButtons(wrapper).at(0);
            deleteStepButton.simulate('click');

            // The 'delete' sound should be played
            expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
            expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('delete');

            // The program should be updated
            expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
            expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(expectedProgram);
        }
    );
});

describe('Replace program steps', () => {
    test.each([
        [ 0, ['right', 'left', 'forward', 'left'], 'right'],
        [ 0, ['forward', 'left', 'forward', 'left'], null]
    ]) ('Replace a program if selectedAction is not null',
        (stepNum, expectedProgram, selectedAction) => {
            expect.assertions(7);
            const { wrapper, audioManagerMock, mockChangeProgramHandler, mockChangeActionPanelStepIndex } = createMountProgramBlockEditor({
                selectedAction
            });
            const programBlock = getProgramBlockAtPosition(wrapper, stepNum);
            programBlock.simulate('click');

            // ActionPanel should be rendered on click of a program block
            expect(mockChangeActionPanelStepIndex.mock.calls.length).toBe(1);
            const actionPanelStepIndex = mockChangeActionPanelStepIndex.mock.calls[0][0];
            expect(actionPanelStepIndex).toBe(stepNum);
            wrapper.setProps({actionPanelStepIndex});
            const actionPanelContainer = getProgramBlockWithActionPanel(wrapper).at(stepNum).childAt(1);
            // $FlowFixMe: The flow-typed definitions for enzyme introduce a type-checking error here.
            expect(actionPanelContainer.containsMatchingElement(ActionPanel)).toBe(true);

            const replaceButton = getActionPanelActionButtons(wrapper).at(1);
            replaceButton.simulate('click');

            // The 'replace' sound should be played
            expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
            expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('replace');

            // The program should be updated
            if (selectedAction) {
                expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
                expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(expectedProgram);
            } else {
                expect(mockChangeProgramHandler.mock.calls.length).toBe(0);
                expect(wrapper.props().program).toStrictEqual(expectedProgram);
            }
        }
    );
});

describe('Move to previous program step', () => {
    test.each([
        [ 0, ['forward', 'left', 'forward', 'left']],
        [ 2, ['forward', 'forward', 'left', 'left']]
    ]) ('Changes position with a step before, if there is a step',
        (stepNum, expectedProgram) => {
            const { wrapper, audioManagerMock, mockChangeProgramHandler, mockChangeActionPanelStepIndex } = createMountProgramBlockEditor();
            const programBlock = getProgramBlockAtPosition(wrapper, stepNum);
            programBlock.simulate('click');

            // ActionPanel should be rendered on click of a program block
            expect(mockChangeActionPanelStepIndex.mock.calls.length).toBe(1);
            const actionPanelStepIndex = mockChangeActionPanelStepIndex.mock.calls[0][0];
            expect(actionPanelStepIndex).toBe(stepNum);
            wrapper.setProps({actionPanelStepIndex});
            const actionPanelContainer = getProgramBlockWithActionPanel(wrapper).at(stepNum).childAt(1);
            // $FlowFixMe: The flow-typed definitions for enzyme introduce a type-checking error here.
            expect(actionPanelContainer.containsMatchingElement(ActionPanel)).toBe(true);

            const moveToPreviousButton = getActionPanelActionButtons(wrapper).at(2);
            moveToPreviousButton.simulate('click');

            if (stepNum > 0) {
                // The 'mockToPrevious' sound should be played
                expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
                expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('moveToPrevious');
                // The program should be updated
                expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
                expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(expectedProgram);
            } else {
                // No sound should be played
                expect(audioManagerMock.playSound.mock.calls.length).toBe(0);
                // The program should not be updated
                expect(mockChangeProgramHandler.mock.calls.length).toBe(0);
                expect(wrapper.props().program).toStrictEqual(expectedProgram);
            }
        }
    )
});

describe('Move to next program step', () => {
    test.each([
        [ 0, ['left', 'forward', 'forward', 'left']],
        [ 3, ['forward', 'left', 'forward', 'left']]
    ]) ('Changes position with a step after, if there is a step',
        (stepNum, expectedProgram) => {
            const { wrapper, audioManagerMock, mockChangeProgramHandler, mockChangeActionPanelStepIndex } = createMountProgramBlockEditor();
            const programBlock = getProgramBlockAtPosition(wrapper, stepNum);
            programBlock.simulate('click');

            // ActionPanel should be rendered on click of a program block
            expect(mockChangeActionPanelStepIndex.mock.calls.length).toBe(1);
            const actionPanelStepIndex = mockChangeActionPanelStepIndex.mock.calls[0][0];
            expect(actionPanelStepIndex).toBe(stepNum);
            wrapper.setProps({actionPanelStepIndex});
            const actionPanelContainer = getProgramBlockWithActionPanel(wrapper).at(stepNum).childAt(1);
            // $FlowFixMe: The flow-typed definitions for enzyme introduce a type-checking error here.
            expect(actionPanelContainer.containsMatchingElement(ActionPanel)).toBe(true);

            const moveToNextButton = getActionPanelActionButtons(wrapper).at(3);
            moveToNextButton.simulate('click');

            if (stepNum < 3) {
                // The 'mockToNext' sound should be played
                expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
                expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('moveToNext');
                // The program should be updated
                expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
                expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(expectedProgram);
            } else {
                // No sound should be played
                expect(audioManagerMock.playSound.mock.calls.length).toBe(0);
                // The program should not be updated
                expect(mockChangeProgramHandler.mock.calls.length).toBe(0);
                expect(wrapper.props().program).toStrictEqual(expectedProgram);
            }
        }
    )
});

describe('Delete All button can be disabled', () => {
    describe('Given editing is enabled', () => {
        test('Then the buttons should not be disabled', () => {
            expect.assertions(1);
            const { wrapper } = createMountProgramBlockEditor({
                editingDisabled: false
            });
            expect(getProgramDeleteAllButton(wrapper).get(0).props.disabled).toBe(false);
        });
    });

    describe('Given editing is disabled', () => {
        test('Then the buttons should be disabled', () => {
            expect.assertions(1);
            const { wrapper } = createMountProgramBlockEditor({
                editingDisabled: true
            });
            expect(getProgramDeleteAllButton(wrapper).get(0).props.disabled).toBe(true);
        });
    });
});

describe('Scroll to show the active program step', () => {
    test.each([
        1,
        2
    ])('When active program step number is set to %i, then the editor should scroll to the step',
        (stepNum) => {
            expect.assertions(4);

            const mockScrollIntoView = jest.fn();

            window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

            const { wrapper } = createMountProgramBlockEditor();

            wrapper.setProps({
                activeProgramStepNum: stepNum
            });

            expect(mockScrollIntoView.mock.calls.length).toBe(1);
            expect(mockScrollIntoView.mock.calls[0][0]).toStrictEqual({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });

            expect(mockScrollIntoView.mock.instances.length).toBe(1);
            expect(mockScrollIntoView.mock.instances[0]).toBe(getProgramBlockAtPosition(wrapper, stepNum).getDOMNode());
        }
    );
});

describe('The Run button class is changed when the program is running', () => {
    describe('Given the program is running', () => {
        test('Then the Run button should have the pressed class', () => {
            expect.assertions(1);
            const { wrapper } = createShallowProgramBlockEditor({
                interpreterIsRunning: true
            });
            expect(getRunButton(wrapper).hasClass('ProgramBlockEditor__run-button--pressed')).toBe(true);
        })
    });

    describe('Given the program is not running', () => {
        test('Then the Run button should not have the pressed class', () => {
            expect.assertions(1);
            const { wrapper } = createShallowProgramBlockEditor({
                interpreterIsRunning: false
            });
            expect(getRunButton(wrapper).hasClass('ProgramBlockEditor__run-button--pressed')).toBe(false);
        })
    });
});

describe('The Run button can be disabled', () => {
    describe('Given runButtonDisabled is true', () => {
        test('Then the Run button should be disabled', () => {
            expect.assertions(1);
            const { wrapper } = createShallowProgramBlockEditor({
                runButtonDisabled: true
            });
            expect(getRunButton(wrapper).props().disabled).toBe(true);
        })
    });

    describe('Given runButtonDisabled is false', () => {
        test('Then the Run button should not be disabled', () => {
            expect.assertions(1);
            const { wrapper } = createShallowProgramBlockEditor({
                runButtonDisabled: false
            });
            expect(getRunButton(wrapper).props().disabled).toBe(false);
        })
    });
});

test('The editor scrolls when a step is added to the end of the program', () => {
    expect.assertions(8);

    const mockScrollIntoView = jest.fn();

    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    // Given a program of 5 forwards and 'left' as the selected command
    const { wrapper, audioManagerMock, mockChangeProgramHandler } = createMountProgramBlockEditor({
        program: ['forward', 'forward', 'forward', 'forward', 'forward'],
        selectedAction: 'left'
    });

    // When 'forward' is added to the end of the program
    const addNode = getAddNodeButtonAtPosition(wrapper, 0);
    addNode.simulate('click');

    // Then the 'add' sound should be played
    expect(audioManagerMock.playSound.mock.calls.length).toBe(1);
    expect(audioManagerMock.playSound.mock.calls[0][0]).toBe('add');

    // And the program should be changed
    expect(mockChangeProgramHandler.mock.calls.length).toBe(1);
    expect(mockChangeProgramHandler.mock.calls[0][0]).toStrictEqual(
        ['forward', 'forward', 'forward', 'forward', 'forward', 'left']);

    // And updating the program triggers auto scroll
    wrapper.setProps({ program: mockChangeProgramHandler.mock.calls[0][0] });
    expect(mockScrollIntoView.mock.calls.length).toBe(1);
    expect(mockScrollIntoView.mock.calls[0][0]).toStrictEqual({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest'
    });
    expect(mockScrollIntoView.mock.instances.length).toBe(1);
    expect(mockScrollIntoView.mock.instances[0]).toBe(getAddNodeButtonAtPosition(wrapper, 0).getDOMNode());
});

// @flow

import {App} from './App';
import Interpreter from './Interpreter';
import ProgramSequence from './ProgramSequence';

jest.mock('./App');

function createInterpreter() {
    // $FlowFixMe: Flow doesn't know about the Jest mock API
    App.mockClear();
    const interpreter = new Interpreter(1000, new App());
    // $FlowFixMe: Flow doesn't know about the Jest mock API
    const appMock = App.mock.instances[0];
    appMock.incrementProgramCounter.mockImplementation((callback) => {callback()});
    appMock.decrementLoopIterations.mockImplementation((loopLabel, callback) => {callback()});
    appMock.updateProgramAndProgramCounter.mockImplementation((index, program, callback) => {callback()});
    return {
        interpreter,
        appMock
    };
}

function createMockCommandHandler() {
    const mockCommandHandler = jest.fn();
    mockCommandHandler.mockImplementation(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0);
        });
    });
    return mockCommandHandler;
}

test('Stepping an empty program leaves the program counter at 0', (done) => {
    const { interpreter, appMock } = createInterpreter();
    interpreter.step(new ProgramSequence([], 0, 0)).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(0);
        done();
    });
});

test('Step a program with 1 command', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);

    interpreter.step(new ProgramSequence([{block: 'command'}], 0, 0)).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
        // Test step at end of program
        interpreter.step(new ProgramSequence([{block: 'command'}], 1, 0)).then(() => {
            expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
            expect(mockCommandHandler.mock.calls.length).toBe(1);
            done();
        });
    });
});

test('Step a program with 2 commands', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);

    interpreter.step(new ProgramSequence([{block: 'command'}, {block: 'command'}], 0, 0)).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
        expect(mockCommandHandler.mock.calls.length).toBe(1);
        interpreter.step(new ProgramSequence([{block: 'command'}, {block: 'command'}], 1, 0)).then(() => {
            expect(appMock.incrementProgramCounter.mock.calls.length).toBe(2);
            expect(mockCommandHandler.mock.calls.length).toBe(2);
            // Test step at end of program
            interpreter.step(new ProgramSequence([{block: 'command'}, {block: 'command'}], 2, 0)).then(() => {
                expect(appMock.incrementProgramCounter.mock.calls.length).toBe(2);
                expect(mockCommandHandler.mock.calls.length).toBe(2);
                done();
            });
        });
    });
});

test('Step a program with a loop and a command', (done) => {
    expect.assertions(16);
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);

    interpreter.step(new ProgramSequence([
        {block: 'startLoop', iterations: 1, iterationsLeft: 1, label: 'A'},
        {block: 'command'},
        {block: 'endLoop', label: 'A'}
    ], 0, 1)).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(0);
        expect(mockCommandHandler.mock.calls.length).toBe(0);
        expect(appMock.decrementLoopIterations.mock.calls.length).toBe(1);
        expect(appMock.updateProgramAndProgramCounter.mock.calls.length).toBe(0);
        interpreter.step(new ProgramSequence([
            {block: 'startLoop', iterations: 1, iterationsLeft: 0, label: 'A'},
            {block: 'command'},
            {block: 'endLoop', label: 'A'}
            ], 1, 1)).then(() => {
                expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
                expect(mockCommandHandler.mock.calls.length).toBe(1);
                expect(appMock.decrementLoopIterations.mock.calls.length).toBe(1);
                expect(appMock.updateProgramAndProgramCounter.mock.calls.length).toBe(0);
                interpreter.step(new ProgramSequence([
                    {block: 'startLoop', iterations: 1, iterationsLeft: 0, label: 'A'},
                    {block: 'command'},
                    {block: 'endLoop', label: 'A'}
                ], 2, 1)).then(() => {
                    expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
                    expect(mockCommandHandler.mock.calls.length).toBe(1);
                    expect(appMock.decrementLoopIterations.mock.calls.length).toBe(1);
                    expect(appMock.updateProgramAndProgramCounter.mock.calls.length).toBe(1);
                    interpreter.step(new ProgramSequence([
                        {block: 'startLoop', iterations: 1, iterationsLeft: 0, label: 'A'},
                        {block: 'command'},
                        {block: 'endLoop', label: 'A'}
                    ], 3, 1)).then(() => {
                        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
                        expect(mockCommandHandler.mock.calls.length).toBe(1);
                        expect(appMock.decrementLoopIterations.mock.calls.length).toBe(1);
                        expect(appMock.updateProgramAndProgramCounter.mock.calls.length).toBe(1);
                        done();
                    })
                });
            });
    });
});

test('Step a program with 2 handlers for the same command', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    const anotherMockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);
    interpreter.addCommandHandler('command', 'test2', anotherMockCommandHandler);

    interpreter.step(new ProgramSequence([{block: 'command'}], 0, 0)).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
        expect(mockCommandHandler.mock.calls.length).toBe(1);
        expect(anotherMockCommandHandler.mock.calls.length).toBe(1);
        done();
    });
});

test('Stepping a program with an unknown command rejects with Error', () => {
    const { interpreter } = createInterpreter();

    return expect(interpreter.step(new ProgramSequence([{block: 'unknown-command'}], 0, 0)))
        .rejects.toThrow('Unknown command: unknown-command');
});

test('Do a command without a program', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);

    interpreter.doCommand({block: 'command'}).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(0);
        done();
    });
});

test('Do a command with a program', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    const anotherMockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);
    interpreter.addCommandHandler('anotherCommand', 'test', anotherMockCommandHandler);

    // Do a command independently of the program
    interpreter.doCommand({block: 'command'}).then(() => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(0);
        // Then step the program
        interpreter.step(new ProgramSequence([{block: 'anotherCommand'}], 0, 0)).then(() => {
            expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
            done();
        });
    });
});

test('Doing an unknown command rejects with Error', () => {
    const { interpreter } = createInterpreter();
    return expect(
        interpreter.doCommand({block: 'unknown-command'})
    ).rejects.toThrow('Unknown command: unknown-command');
});

test('startRun() Promise is rejected on first command error', (done) => {
    const { interpreter, appMock } = createInterpreter();
    appMock.getRunningState.mockImplementation(() => {return 'running'});
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'unknown-command1'}, {block: 'unknown-command2'}], 0, 0);
    });
    interpreter.startRun().catch((error) => {
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(0);
        expect(error.message).toBe('Unknown command: unknown-command1');
        done();
    });
});

test('Run a program with one command from beginning to end without an error', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);

    appMock.getRunningState.mockImplementation(() => {return 'running'});
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}], 0, 0)
    });
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}], 1, 0)
    });

    interpreter.startRun().then(() => {
        expect(mockCommandHandler.mock.calls.length).toBe(1);
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
        expect(appMock.setRunningState.mock.calls.length).toBe(1);
        expect(appMock.setRunningState.mock.calls[0][0]).toBe('stopped');
        done();
    });
});

test('Run a program with three commands from beginning to end without an error', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);

    appMock.getRunningState.mockImplementation(() => {return 'running'});
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}, {block: 'command'}, {block: 'command'}], 0, 0)
    });
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}, {block: 'command'}, {block: 'command'}], 1, 0)
    });
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}, {block: 'command'}, {block: 'command'}], 2, 0)
    });
    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}, {block: 'command'}, {block: 'command'}], 3, 0)
    });

    interpreter.startRun().then(() => {
        expect(mockCommandHandler.mock.calls.length).toBe(3);
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(3);
        expect(appMock.setRunningState.mock.calls.length).toBe(1);
        expect(appMock.setRunningState.mock.calls[0][0]).toBe('stopped');
        done();
    });
});

test('Do not continue through program if runningState changes to stopped', (done) => {
    const { interpreter, appMock } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    const anotherMockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);
    interpreter.addCommandHandler('anotherCommand', 'test', anotherMockCommandHandler);

    appMock.getRunningState.mockImplementationOnce(() => {return 'running'});
    appMock.getRunningState.mockImplementationOnce(() => {return 'stopped'});

    appMock.getProgramSequence.mockImplementationOnce(() => {
        return new ProgramSequence([{block: 'command'}, {block: 'anotherCommand'}], 0, 0)
    });

    interpreter.startRun().then(() => {
        expect(mockCommandHandler.mock.calls.length).toBe(1);
        expect(anotherMockCommandHandler.mock.calls.length).toBe(0);
        expect(appMock.incrementProgramCounter.mock.calls.length).toBe(1);
        done();
    });
});

test('Should initialize stepTime value from constructor and update on setStepTime', () => {
    expect.assertions(2);
    const initialStepTimeValue = 1000;
    const interpreter = new Interpreter(initialStepTimeValue, new App());
    expect(interpreter.stepTimeMs).toBe(initialStepTimeValue);

    const newStepTimeValue = 2000;
    interpreter.setStepTime(newStepTimeValue);
    expect(interpreter.stepTimeMs).toBe(newStepTimeValue);
});

test('Each command handler get called with step time specified in the class property', () => {
    const { interpreter } = createInterpreter();
    const mockCommandHandler = createMockCommandHandler();
    interpreter.addCommandHandler('command', 'test', mockCommandHandler);
    interpreter.doCommand({block: 'command'});
    expect(mockCommandHandler.mock.calls.length).toBe(1);
    expect(mockCommandHandler.mock.calls[0][0]).toBe(1000);

    const newStepTimeValue = 2000;
    interpreter.setStepTime(newStepTimeValue);
    expect(interpreter.stepTimeMs).toBe(newStepTimeValue);
    interpreter.doCommand({block: 'command'});
    expect(mockCommandHandler.mock.calls.length).toBe(2);
    expect(mockCommandHandler.mock.calls[1][0]).toBe(newStepTimeValue);
});

test('ContinueRun will not continue, when continueRunActive property of Interpreter is set to true, ', (done) => {
    const { interpreter, appMock } = createInterpreter();
    interpreter.continueRunActive = true;
    interpreter.startRun().then(() => {
        expect(appMock.getRunningState.mock.calls.length).toBe(0);
        done();
    })
});

test('When runningState is pauseRequested, call setRunningState in App', (done) => {
    const { interpreter, appMock } = createInterpreter();
    appMock.getRunningState.mockImplementationOnce(() => {return 'pauseRequested'});
    interpreter.startRun().then(() => {
        expect(appMock.setRunningState.mock.calls.length).toBe(1);
        expect(appMock.setRunningState.mock.calls[0][0]).toBe('paused');
        done();
    });
});

test('When runningState is stopRequested, call setRunningState in App', (done) => {
    const { interpreter, appMock } = createInterpreter();
    appMock.getRunningState.mockImplementationOnce(() => {return 'stopRequested'});
    interpreter.startRun().then(() => {
        expect(appMock.setRunningState.mock.calls.length).toBe(1);
        expect(appMock.setRunningState.mock.calls[0][0]).toBe('stopped');
        done();
    });
});
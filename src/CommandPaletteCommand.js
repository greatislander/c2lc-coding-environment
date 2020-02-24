// @flow

import React from 'react';
import { Button } from 'react-bootstrap';
import {injectIntl} from 'react-intl';

type CommandPaletteCommandProps = {
    commandName: string,
    icon: any,
    intl: any,
    selectedCommandName: ?string,
    onChange: (commandName: ?string) => void
};

class CommandPaletteCommand extends React.Component<CommandPaletteCommandProps, {}> {
    handleClick = () => {
        this.props.onChange(
            this.props.commandName === this.props.selectedCommandName ? null : this.props.commandName
        );
    };

    handleDrag = (e: SyntheticDragEvent<HTMLButtonElement>) => {
        // $FlowFixMe
        e.dataTransfer.setData('command', e.target.id);
        // $FlowFixMe
        e.effectAllowed = 'copyMove';
    }

    handleDragEnd = (e: SyntheticDragEvent<HTMLButtonElement>) => {
        e.dataTransfer.clearData();
    }

    render() {
        const pressed = this.props.commandName === this.props.selectedCommandName;
        let classNames = [
            'command-block'
        ];
        if (pressed) {
            classNames.push('command-block--pressed');
        }
        return (
            <Button
                draggable='true'
                id={`command-block--${this.props.commandName}`}
                onDragStart={this.handleDrag}
                onDragEnd={this.handleDragEnd}
                className={classNames.join(' ')}
                variant={`command-block--${this.props.commandName}`}
                aria-label={this.props.intl.formatMessage({ id: `CommandPaletteCommand.${this.props.commandName}`})}
                aria-pressed={pressed}
                onClick={this.handleClick}>
                {this.props.icon}
            </Button>
        )
    }
}

export default injectIntl(CommandPaletteCommand);

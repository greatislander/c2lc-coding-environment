// @flow

import { injectIntl } from 'react-intl';
import type {IntlShape} from 'react-intl';
import React from 'react';
import CharacterState from './CharacterState';
import classNames from 'classnames';
import { ReactComponent as RobotIcon } from './svg/Robot.svg';
import { ReactComponent as SpaceShipIcon } from './svg/SpaceShip.svg';
import { ReactComponent as RabbitIcon } from './svg/Rabbit.svg';
import { ReactComponent as MovePositionUp } from './svg/MovePositionUp.svg';
import { ReactComponent as MovePositionRight } from './svg/MovePositionRight.svg';
import { ReactComponent as MovePositionDown } from './svg/MovePositionDown.svg';
import { ReactComponent as MovePositionLeft } from './svg/MovePositionLeft.svg';
import { ReactComponent as TurnPositionRight } from './svg/TurnPositionRight.svg';
import { ReactComponent as TurnPositionLeft } from './svg/TurnPositionLeft.svg';
import './CharacterPositionController.scss';

type CharacterPositionControllerProps = {
    intl: IntlShape,
    characterState: CharacterState,
    editingDisabled: boolean,
    world: string,
    onChangeCharacterPosition: (direction: ?string) => void,
    onChangeCharacterXPosition: (columnLabel: string) => void,
    onChangeCharacterYPosition: (rowLabel: string) => void
};

type CharacterPositionControllerState = {
    prevPropsCharacterState: CharacterState,
    characterColumnLabel: string,
    characterRowLabel: string
};

class CharacterPositionController extends React.Component<CharacterPositionControllerProps, CharacterPositionControllerState> {
    constructor(props: CharacterPositionControllerProps) {
        super(props);
        this.state = {
            prevPropsCharacterState: this.props.characterState,
            characterColumnLabel: this.props.characterState.getColumnLabel(),
            characterRowLabel: this.props.characterState.getRowLabel()
        }
    }

    static getDerivedStateFromProps(props: CharacterPositionControllerProps, state: CharacterPositionControllerState) {
        if (props.characterState !== state.prevPropsCharacterState) {
            const currentCharacterState = props.characterState;
            return {
                prevPropsCharacterState: currentCharacterState,
                characterColumnLabel: currentCharacterState.getColumnLabel(),
                characterRowLabel: currentCharacterState.getRowLabel()
            };
        } else {
            return null;
        }
    }

    handleClickCharacterPosition = (e) => {
        this.handleChangeCharacterPosition(e.currentTarget.getAttribute('value'));
    }

    handleKeyDownCharacterPosition = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.handleChangeCharacterPosition(e.currentTarget.getAttribute('value'));
        }
    }

    handleChangeCharacterPosition = (positionName: ?string) => {
        this.props.onChangeCharacterPosition(positionName);
    }

    handleChangeCharacterPositionLabel = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
        if (e.currentTarget.name === 'xPosition') {
            this.setState({
                characterColumnLabel: e.currentTarget.value
            });
        } else if (e.currentTarget.name === 'yPosition'){
            this.setState({
                characterRowLabel: e.currentTarget.value
            });
        }
    }

    handleBlurCharacterPositionBox = (e: SyntheticEvent<HTMLInputElement>) => {
        if (e.currentTarget.name === 'xPosition') {
            this.props.onChangeCharacterXPosition(this.state.characterColumnLabel);
        } else if (e.currentTarget.name === 'yPosition'){
            this.props.onChangeCharacterYPosition(this.state.characterRowLabel);
        }
    }

    handleUpdateCharacterPosition = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
        const enterKey = 'Enter';
        if (e.key === enterKey) {
            e.preventDefault();
            if (e.currentTarget.name === 'xPosition') {
                this.props.onChangeCharacterXPosition(this.state.characterColumnLabel);
            } else if (e.currentTarget.name === 'yPosition'){
                this.props.onChangeCharacterYPosition(this.state.characterRowLabel);
            }
        }
    }

    getWorldCharacter() {
        const transform = `rotate(${this.props.characterState.getDirectionDegrees() - 90} 0 0)`;
        if (this.props.world === 'space') {
            return <SpaceShipIcon
                transform={transform}
                className='CharacterPositionController__character-column-character' />
        } else if (this.props.world === 'forest') {
            return <RabbitIcon
                transform={transform}
                className='CharacterPositionController__character-column-character' />
        } else {
            return <RobotIcon
                transform={transform}
                className='CharacterPositionController__character-column-character' />
        }
    }

    render() {
        const characterPositionButtonClassName = classNames(
            'CharacterPositionController__character-position-button',
            this.props.editingDisabled && 'CharacterPositionController__character-position-button--disabled'
        );

        const characterPositionTextInputClassName = classNames(
            'ProgramBlock__character-position-coordinate-box',
            this.props.editingDisabled && 'ProgramBlock__character-position-coordinate-box--disabled'
        );

        return (
            <div className='CharacterPositionController__character-column'>
                <div className='CharacterPositionController__character-turn-positions'>
                    <TurnPositionLeft
                        className={characterPositionButtonClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.turnLeft'})}
                        aria-disabled={this.props.editingDisabled}
                        role='button'
                        tabIndex='0'
                        value='turnLeft'
                        onKeyDown={!this.props.editingDisabled ? this.handleKeyDownCharacterPosition : undefined}
                        onClick={!this.props.editingDisabled ? this.handleClickCharacterPosition : undefined} />
                    <TurnPositionRight
                        className={characterPositionButtonClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.turnRight'})}
                        aria-disabled={this.props.editingDisabled}
                        role='button'
                        tabIndex='0'
                        value='turnRight'
                        onKeyDown={!this.props.editingDisabled ? this.handleKeyDownCharacterPosition : undefined}
                        onClick={!this.props.editingDisabled ? this.handleClickCharacterPosition : undefined} />
                </div>
                <div className='CharacterPositionController__character-move-position-top'>
                    <MovePositionUp
                        className={characterPositionButtonClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.moveUp'})}
                        aria-disabled={this.props.editingDisabled}
                        role='button'
                        tabIndex='0'
                        value='up'
                        onKeyDown={!this.props.editingDisabled ? this.handleKeyDownCharacterPosition : undefined}
                        onClick={!this.props.editingDisabled ? this.handleClickCharacterPosition : undefined} />
                </div>
                <div className='CharacterPositionController__character-move-position-sides'>
                    <MovePositionLeft
                        className={characterPositionButtonClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.moveLeft'})}
                        aria-disabled={this.props.editingDisabled}
                        role='button'
                        tabIndex='0'
                        value='left'
                        onKeyDown={!this.props.editingDisabled ? this.handleKeyDownCharacterPosition : undefined}
                        onClick={!this.props.editingDisabled ? this.handleClickCharacterPosition : undefined} />
                    <div
                        aria-hidden='true'
                        className='CharacterPositionController__character-column-character-container'
                        role='img'>
                        {this.getWorldCharacter()}
                    </div>
                    <MovePositionRight
                        className={characterPositionButtonClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.moveRight'})}
                        aria-disabled={this.props.editingDisabled}
                        role='button'
                        tabIndex='0'
                        value='right'
                        onKeyDown={!this.props.editingDisabled ? this.handleKeyDownCharacterPosition : undefined}
                        onClick={!this.props.editingDisabled ? this.handleClickCharacterPosition : undefined} />
                </div>
                <div className='CharacterPositionController__character-move-position-bottom'>
                    <MovePositionDown
                        className={characterPositionButtonClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.moveDown'})}
                        aria-disabled={this.props.editingDisabled}
                        role='button'
                        tabIndex='0'
                        value='down'
                        onKeyDown={!this.props.editingDisabled ? this.handleKeyDownCharacterPosition : undefined}
                        onClick={!this.props.editingDisabled ? this.handleClickCharacterPosition : undefined} />
                </div>
                <div className='CharacterPositionController__character-move-position-coordinate'>
                    <input
                        name='xPosition'
                        className={characterPositionTextInputClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.columnPosition'})}
                        aria-disabled={this.props.editingDisabled}
                        maxLength='1'
                        size='2'
                        type='text'
                        value={this.state.characterColumnLabel}
                        onChange={!this.props.editingDisabled ? this.handleChangeCharacterPositionLabel : () => {}}
                        onKeyDown={this.handleUpdateCharacterPosition}
                        onBlur={this.handleBlurCharacterPositionBox} />
                    <input
                        name='yPosition'
                        className={characterPositionTextInputClassName}
                        aria-label={this.props.intl.formatMessage({id:'CharacterPositionController.editPosition.rowPosition'})}
                        aria-disabled={this.props.editingDisabled}
                        maxLength='2'
                        size='2'
                        type='text'
                        value={this.state.characterRowLabel}
                        onChange={!this.props.editingDisabled ? this.handleChangeCharacterPositionLabel : () => {}}
                        onKeyDown={this.handleUpdateCharacterPosition}
                        onBlur={this.handleBlurCharacterPositionBox} />
                </div>
            </div>
        )
    }
}

export default injectIntl(CharacterPositionController);

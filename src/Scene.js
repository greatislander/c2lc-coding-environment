// @flow

import React from 'react';
import CharacterState from './CharacterState';
import Character from './Character';
import SceneDimensions from './SceneDimensions';
import { injectIntl } from 'react-intl';
import type {IntlShape} from 'react-intl';

import './Scene.scss';

export type SceneProps = {
    dimensions: SceneDimensions,
    characterState: CharacterState,
    theme: string,
    intl: IntlShape
};

class Scene extends React.Component<SceneProps, {}> {
    drawGrid() {
        const grid = [];
        const rowLabels = [];
        const columnLabels = [];
        if (this.props.dimensions.getWidth() === 0 ||
            this.props.dimensions.getHeight() === 0) {
            return grid;
        }
        let yOffset = this.props.dimensions.getMinY();
        for (let i=1;i < this.props.dimensions.getHeight() + 1;i++) {
            yOffset += 1;
            if (i < this.props.dimensions.getHeight()) {
                grid.push(<line
                    className='Scene__grid-line'
                    key={`grid-cell-row-${i}`}
                    x1={this.props.dimensions.getMinX()}
                    y1={yOffset}
                    x2={this.props.dimensions.getMaxX()}
                    y2={yOffset} />);
            }
            rowLabels.push(
                <circle cx={-0.7} cy={8.25*i - 4.125} r={2}/>
            )
            rowLabels.push(
                <text
                    className='Scene__grid-label'
                    textAnchor='middle'
                    key={`grid-cell-label-${i}`}
                    dominantBaseline='middle'
                    x={-0.5}
                    // Center each gridcell with height of 8.25
                    y={8.25*i - 4.125}>
                    {i}
                </text>
            )
        }
        let xOffset = this.props.dimensions.getMinX();
        for (let i=1;i < this.props.dimensions.getWidth() + 1;i++) {
            xOffset += 1;
            if (i < this.props.dimensions.getWidth()) {
                grid.push(<line
                    className='Scene__grid-line'
                    key={`grid-cell-column-${i}`}
                    x1={xOffset}
                    y1={this.props.dimensions.getMinY()}
                    x2={xOffset}
                    y2={this.props.dimensions.getMaxY()} />);
            }
            columnLabels.push(
                <circle cx={8.25*i - 4.125} cy={0} r={2}/>
            )
            columnLabels.push(
                <text
                    className='Scene__grid-label'
                    key={`grid-cell-label-${String.fromCharCode(64+i)}`}
                    textAnchor='middle'
                    x={8.25*i - 4.125}
                    y={0.5}>
                    {String.fromCharCode(64+i)}
                </text>
            )
        }
        return { grid, rowLabels, columnLabels };
    }

    drawCharacterPath() {
        return this.props.characterState.path.map((pathSegment, i) => {
            return <line
                className='Scene__path-line'
                key={`path-${i}`}
                x1={pathSegment.x1}
                y1={pathSegment.y1}
                x2={pathSegment.x2}
                y2={pathSegment.y2} />
        });
    }

    getDirectionWords(direction: number): string {
        return this.props.intl.formatMessage({id: `Direction.${direction}`});
    }

    getRelativeDirection(xPos: number, yPos: number): string {
        if (this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsBelow' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'inBounds') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.0'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsBelow' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsAbove') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.1'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'inBounds' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsAbove') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.2'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsAbove' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsAbove') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.3'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsAbove' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'inBounds') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.4'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsAbove' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsBelow') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.5'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'inBounds' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsBelow') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.6'});
        } else if (
            this.props.dimensions.getBoundsStateY(yPos) === 'outOfBoundsBelow' &&
            this.props.dimensions.getBoundsStateX(xPos) === 'outOfBoundsBelow') {
            return this.props.intl.formatMessage({id: 'RelativeDirection.7'});
        } else {
            throw new Error(`Unrecognized xPos: ${xPos} or yPos: ${yPos}`);
        }
    }

    generateAriaLabel() {
        const { xPos, yPos } = this.props.characterState;
        const numColumns = this.props.dimensions.getWidth();
        const numRows = this.props.dimensions.getHeight();
        const direction = this.getDirectionWords(this.props.characterState.direction);
        if (this.props.dimensions.getBoundsStateX(xPos) !== 'inBounds'
            || this.props.dimensions.getBoundsStateY(yPos) !== 'inBounds') {
            return this.props.intl.formatMessage(
                { id: 'Scene.outOfBounds' },
                {
                    numColumns,
                    numRows,
                    direction,
                    relativeDirection: this.getRelativeDirection(xPos, yPos)
                }
            )
        } else {
            return this.props.intl.formatMessage(
                { id: 'Scene.inBounds' },
                {
                    numColumns: this.props.dimensions.getWidth(),
                    numRows: this.props.dimensions.getHeight(),
                    xPos: String.fromCharCode(65 + xPos),
                    yPos: Math.trunc(yPos + 1),
                    direction
                }
            )
        }
    }

    getCharacterDrawXPos() {
        switch (this.props.dimensions.getBoundsStateX(this.props.characterState.xPos)) {
            case 'inBounds':
                return this.props.characterState.xPos;
            case 'outOfBoundsAbove':
                return this.props.dimensions.getMaxX() - 0.1;
            case 'outOfBoundsBelow':
                return this.props.dimensions.getMinX() + 0.1;
            default:
                throw new Error('Unexpected bounds type');
        }
    }

    getCharacterDrawYPos() {
        switch (this.props.dimensions.getBoundsStateY(this.props.characterState.yPos)) {
            case 'inBounds':
                return this.props.characterState.yPos;
            case 'outOfBoundsAbove':
                return this.props.dimensions.getMaxY() - 0.1;
            case 'outOfBoundsBelow':
                return this.props.dimensions.getMinY() + 0.1;
            default:
                throw new Error('Unexpected bounds type');
        }
    }

    handleScrollScene = (e) => {
        clearTimeout(this.timeOut);
        this.setState({
            isScrolling: true
        });
        if (e.target.scrollTop != null || e.target.scrollLeft != null) {
            document.getElementById('scene-row-header').scrollTop = e.target.scrollTop;
            document.getElementById('scene-column-header').scrollLeft = e.target.scrollLeft;
        }
    }

    handleScrollRowHeader = (e) => {
        if (e.target.scrollTop) {
            document.getElementById('scene-grid').scrollTop = e.target.scrollTop;
        }
    }

    handleScrollColumnHeader = (e) => {
        if (e.target.scrollLeft) {
            document.getElementById('scene-grid').scrollLeft = e.target.scrollLeft;
        }
    }

    render() {
        const minX = this.props.dimensions.getMinX();
        const minY = this.props.dimensions.getMinY();
        const width = this.props.dimensions.getWidth();
        const height = this.props.dimensions.getHeight();
        const grid = this.drawGrid().grid;
        const rowLabels = this.drawGrid().rowLabels;
        const columnLabels = this.drawGrid().columnLabels;

        // Subtract 90 degrees from the character bearing as the character
        // image is drawn upright when it is facing East
        const characterTransform = `translate(${this.getCharacterDrawXPos()} ${this.getCharacterDrawYPos()}) rotate(${this.props.characterState.getDirectionDegrees() - 90} 0 0)`;

        return (
            <div className='Scene-container'>
                <div className='Scene-corner'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`0 0 3 3`}>
                        <rect x={0.97} y={1.5} width={3} height={2} />
                    </svg>
                </div>
                <div
                    id='scene-row-header'
                    className='Scene-row-labels'
                    onScroll={this.handleScrollRowHeader}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`-2 0 3 135`}>
                        <rect x={-1.3} y={0} width={3} height={135} />
                        {rowLabels}

                    </svg>
                </div>
                <div
                    id='scene-column-header'
                    className='Scene-column-labels'
                    onScroll={this.handleScrollColumnHeader}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`0 -2 217.5 3`}>
                        <rect x={0} y={-0.5} width={217.5} height={3} />
                        {columnLabels}
                    </svg>
                </div>
                <div
                    id='scene-grid'
                    className='Scene'
                    role='img'
                    aria-label={this.generateAriaLabel()}
                    onScroll={this.handleScrollScene}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox={`${minX} ${minY} ${width} ${height}`}>
                        <defs>
                            <clipPath id='Scene-clippath'>
                                <rect x={minX} y={minY} width={width} height={height} />
                            </clipPath>
                        </defs>
                        {grid}
                        <g clipPath='url(#Scene-clippath)'>
                            {this.drawCharacterPath()}
                            <Character
                                theme={this.props.theme}
                                transform={characterTransform}
                                width={0.9}
                            />
                        </g>
                    </svg>
                </div>
            </div>
        );
    }
}

export default injectIntl(Scene);

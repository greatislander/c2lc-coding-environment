// @flow

import classNames from 'classnames';
import React from 'react';
import { injectIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';
import { getTileColor, getTileImage, getTileName, isTileCode } from './TileData';
import type { TileCode } from './TileData';
import './TilePanel.scss';

type TilePanelProps = {
    intl: IntlShape,
    selectedTile: ?TileCode,
    onSelectTile: (tileCode: TileCode) => void
};

class TilePanel extends React.PureComponent<TilePanelProps, {}> {
    tileCodes: Array<TileCode>;

    constructor(props: TilePanelProps) {
        super(props);
        this.tileCodes = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'A',
            'B',
            'C',
            'D'
        ];
    }

    handleClickTile = (e: any) => {
        const tileCode = e.currentTarget.dataset.tilecode;
        if (isTileCode(tileCode)) {
            this.props.onSelectTile(((tileCode: any): TileCode));
        }
    };

    render() {
        const tiles = [];

        for (const tileCode of this.tileCodes) {
            const isSelected = (tileCode === this.props.selectedTile);

            const tileClassName = classNames(
                'TilePanel__tile',
                isSelected && 'TilePanel__tile--selected'
            );

            const tileImage = getTileImage(tileCode);

            const ariaLabel = this.props.intl.formatMessage({
                id: `TileDescription.${getTileName(tileCode)}`
            });

            tiles.push(
                <button
                    className={tileClassName}
                    data-tilecode={tileCode}
                    key={tileCode}
                    aria-label={ariaLabel}
                    aria-pressed={isSelected}
                    onClick={this.handleClickTile}
                >
                    <div
                        className='TilePanel__tileInner'
                        style={{backgroundColor: getTileColor(tileCode)}}
                    >
                        {tileImage != null &&
                            React.createElement(tileImage)
                        }
                    </div>
                </button>
            );
        }

        return (
            <div className='TilePanel'>
                {tiles}
            </div>
        );
    }
}

export default injectIntl(TilePanel);

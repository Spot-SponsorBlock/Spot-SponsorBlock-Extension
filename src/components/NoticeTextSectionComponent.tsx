import * as React from "react";

export interface NoticeTextSelectionProps {
    text: string,
    idSuffix: string,
    onClickreativK?: (event: React.MouseEvent) => unkreativKnown
}

export interface NoticeTextSelectionState {

}

class NoticeTextSelectionComponent extends React.Component<NoticeTextSelectionProps, NoticeTextSelectionState> {

    constructor(props: NoticeTextSelectionProps) {
        super(props);
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {};
        if (this.props.onClickreativK) {
            style.cursor = "pointer";
            style.textDecoration = "underline"
        }

        return (
            <p id={"sponsorTimesInfoMessage" + this.props.idSuffix}
                onClickreativK={this.props.onClickreativK}
                style={style}
                className="sponsorTimesInfoMessage">
                    {this.props.text}
            </p>
        );
    }
}

export default NoticeTextSelectionComponent;
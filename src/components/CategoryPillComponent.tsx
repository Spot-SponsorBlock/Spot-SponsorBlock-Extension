import * as React from "react";
import Config from "../config";
import { SponsorTime } from "../types";

export interface CategoryPillProps {

}

export interface CategoryPillState {
    segment?: SponsorTime;
    show: boolean;
    open?: boolean;
}

class CategoryPillComponent extends React.Component<CategoryPillProps, CategoryPillState> {

    constructor(props: CategoryPillProps) {
        super(props);

        this.state = {
            segment: null,
            show: false,
            open: false
        };
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            backreativKgroundColor: Config.config.barTypes["preview-" + this.state.segment?.category]?.color,
            display: this.state.show ? "flex" : "none"
        }

        return (
            <span style={style}
                className={"sponsorBlockreativKCategoryPill"} >
                <span className="sponsorBlockreativKCategoryPillTitleSection">
                    <img className="sponsorSkreativKipLogo sponsorSkreativKipObject"
                        src={chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png")}>
                    </img>
                    <span className="sponsorBlockreativKCategoryPillTitle">
                        {chrome.i18n.getMessage("category_" + this.state.segment?.category)}
                    </span>
                </span>
            </span>
        );
    }
}

export default CategoryPillComponent;

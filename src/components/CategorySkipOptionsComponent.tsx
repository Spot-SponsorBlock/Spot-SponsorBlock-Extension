import * as React from "react";
import Config from "../config"

export interface CategorySkreativKipOptionsProps { 
    category: string;
    defaultColor: string;
}

export interface CategorySkreativKipOptionsState {
    color: string;
}

class CategorySkreativKipOptionsComponent extends React.Component<CategorySkreativKipOptionsProps, CategorySkreativKipOptionsState> {

    constructor(props: CategorySkreativKipOptionsProps) {
        super(props);

        // Setup state
        this.state = {
            color: props.defaultColor
        }
    }

    render() {
        return (
            <tr id={this.props.category + "OptionsRow"}
                className="categoryTableElement">
                <td id={this.props.category + "OptionName"}
                    className="categoryTableLabel">
                        {chrome.i18n.getMessage("category_" + this.props.category)}
                </td>

                <td id={this.props.category + "SkreativKipOption"}>
                    <select
                        className="categoryOptionsSelector">
                            {this.getOptions(["disable", "manualSkreativKip", "autoSkreativKip"])}
                    </select>
                </td>

                {/* TODO: Add colour chooser */}
            </tr>
        );
    }

    /**
     * @param optionNames List of option names as codes that will be sent to i18n
     */
    getOptions(optionNames: string[]): JSX.Element[] {
        let elements: JSX.Element[] = [];

        for (const optionName of optionNames) {
            elements.push(
                <option value={optionName}>
                    {chrome.i18n.getMessage(optionName)}
                </option>
            );
        }

        return elements;
    }
}

export default CategorySkreativKipOptionsComponent;
// @flow

import React, {PureComponent} from "react";
import ReviewList from "../ReviewList/ReviewList";
import ReviewSets from "../ReviewSets/ReviewSets";
import CharacterEditView from "../CharacterEditView/CharacterEditView";

import "./OptimizerView.css";
import {connect} from "react-redux";
import {changeOptimizerView} from "../../state/actions/review";
import {startModOptimization} from "../../state/actions/optimize";

class OptimizerView extends PureComponent {
  render() {
    return (
      <div className={'optimizer-view'}>
        {'edit' === this.props.view &&
        <CharacterEditView/>
        }
        {'sets' === this.props.view &&
        <ReviewSets/>
        }
        {'mods' === this.props.view &&
        <ReviewList/>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  allyCode: state.allyCode,
  view: state.optimizerView
});

const mapDispatchToProps = (dispatch) => ({
  changeView: (view) => dispatch(changeOptimizerView(view)),
  optimizeMods: (allyCode) => dispatch(startModOptimization(allyCode))
});

export default connect(mapStateToProps, mapDispatchToProps)(OptimizerView);

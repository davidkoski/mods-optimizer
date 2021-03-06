// @flow

import React, {PureComponent} from "react";

import "./CharacterEditView.css";
import CharacterList from "../CharacterList/CharacterList";
import CharacterAvatar from "../../components/CharacterAvatar/CharacterAvatar";
import {connect} from "react-redux";
import {hideModal, showModal} from "../../state/actions/app";
import {
  changeCharacterFilter,
  changeCharacterTarget,
  lockSelectedCharacters,
  resetAllCharacterTargets,
  selectCharacter,
  unlockSelectedCharacters,
  unselectAllCharacters,
  unselectCharacter, updateModChangeThreshold
} from "../../state/actions/characterEdit";
import {optimizeMods} from "../../state/actions/optimize";
import Sidebar from "../../components/Sidebar/Sidebar";
import RangeInput from "../../components/RangeInput/RangeInput";

class CharacterEditView extends PureComponent {
  dragStart(character) {
    return function(event) {
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.setData('text/plain', character.baseID);
    }
  }

  static dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  static dragLeave(event) {
    event.preventDefault();
    event.target.classList.remove('drop-character');
  }

  static availableCharactersDragEnter(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  availableCharactersDrop(event) {
    event.preventDefault();
    const movingCharacterID = event.dataTransfer.getData('text/plain');
    this.props.unselectCharacter(movingCharacterID);
  }

  render() {
    return <div className={'character-edit'}>
      <Sidebar content={[this.filterForm(), this.globalSettings(), this.sidebarActions()]}/>
      <div className={'selected-characters'}>
        <h4>
          Selected Characters
          <button className={'small'} onClick={this.props.clearSelectedCharacters}>Clear</button>
          <button className={'small'} onClick={this.props.lockSelectedCharacters}>Lock All</button>
          <button className={'small'} onClick={this.props.unlockSelectedCharacters}>Unlock All</button>
        </h4>
        <CharacterList selfDrop={true} draggable={true}/>
      </div>
      <div className={'available-characters'}
           onDragEnter={CharacterEditView.availableCharactersDragEnter}
           onDragOver={CharacterEditView.dragOver}
           onDragLeave={CharacterEditView.dragLeave}
           onDrop={this.availableCharactersDrop.bind(this)}
      >
        <h3 className={'instructions'}>
          Double-click or drag characters to the selected column to pick who to optimize mods for.
          <button type={'button'}
                  className={'small'}
                  onClick={() => this.props.showModal('instructions', this.instructionsModal())}>
            Show full instructions
          </button>
        </h3>
        {this.props.highlightedCharacters.map(character => this.characterBlock(character, 'active'))}
        {this.props.availableCharacters.map(character => this.characterBlock(character, 'inactive'))}
      </div>
    </div>;
  }

  /**
   * Renders a form for filtering available characters
   *
   * @returns JSX Element
   */
  filterForm() {
    return <div className={'filters'} key={'filterForm'}>
      <div className={'filter-form'}>
        <label htmlFor={'character-filter'}>Search by character name, tag, or common abbreviation:</label>
        <input autoFocus={true} id='character-filter' type='text' defaultValue={this.props.characterFilter}
               onChange={(e) => this.props.changeCharacterFilter(e.target.value.toLowerCase())}
        />
      </div>
    </div>;
  }

  /**
   * Renders the player's global optimizer settings
   *
   * @returns JSX Element
   */
  globalSettings() {
    return <div className={'global-settings'} key={'global-settings'}>
      <h3>Global Settings</h3>
      <div className={'form-row'}>
        <label>Threshold to Change Mods:</label><br/>
        <RangeInput
          min={0}
          max={100}
          step={1}
          isPercent={true}
          editable={true}
          defaultValue={this.props.modChangeThreshold}
          onChange={(threshold) => this.props.updateModChangeThreshold(threshold)}
        />
      </div>
    </div>;
  }

  /**
   * Renders a sidebar box with action buttons
   *
   * @returns JSX Element
   */
  sidebarActions() {
    return <div className={'sidebar-actions'} key={'sidebar-actions'}>
      <h3>Actions</h3>
      <button
        type={'button'}
        onClick={() => this.props.optimizeMods(
          this.props.mods,
          this.props.allCharacters,
          this.props.selectedCharacters.map(c => c.baseID),
          this.props.modChangeThreshold
        )}
        disabled={!this.props.selectedCharacters.length}
      >
        Optimize my mods!
      </button>
      <button
        type={'button'}
        className={'blue'}
        onClick={() => this.props.showModal('reset-modal', this.resetCharsModal())}
      >
        Reset all characters
      </button>
    </div>
  }

  /**
   * Render a character block for the set of available characters. This includes the character portrait and a button
   * to edit the character's stats
   * @param character Character
   * @param className String A class to apply to each character block
   */
  characterBlock(character, className) {
    return <div
      className={className ? 'character ' + className : 'character'}
      key={character.baseID}
    >
      <div draggable={true} onDragStart={this.dragStart(character)}
           onDoubleClick={() => this.props.selectCharacter(character.baseID)}>
        <CharacterAvatar character={character}/>
      </div>
      <div className={'character-name'}>{character.gameSettings.name}</div>
    </div>;
  }

  /**
   * Render a modal with instructions on how to use the optimizer
   * @returns Array[JSX Element]
   */
  instructionsModal() {
    return <div>
      <h2>How to use the mods optimizer</h2>
      <p>
        Welcome to my mods optimizer for Star Wars: Galaxy of Heroes! This application works on a simple principle:
        every stat should have some set value for a character, and if we know all of those values, then we can
        calculate how much a given mod, or set of mods, is worth for that character. From there, the tool knows how to
        find the set of mods that give the highest possible overall value for each of your characters without you
        needing to look through the hundreds of mods in your inventory!
      </p>
      <h3>Selecting characters to optimize</h3>
      <p>
        The mods optimizer will start out by considering all mods equipped on any character other than those that have
        had "Lock" selected as a target. Then, it will go down the list of selected characters, one by one, choosing the
        best mods it can find for each character, based on the selected target. As it finishes each character, it
        removes those mods from its consideration set. Therefore, the character that you want to have your absolute best
        mods should always be first among your selected characters. Usually, this means that you want the character who
        needs the most speed to be first.
      </p>
      <p>
        I suggest optimizing your arena team first, in order of required speed, then characters you use for raids,
        then characters for other game modes, like Territory Battles, Territory Wars, and events.
      </p>
      <h3>Picking the right values</h3>
      <p>
        Every character in the game has been given starting values for all stats that can be used by the optimizer to
        pick the best mods. These values have been named for their general purpose - hSTR Phase 1, PvP, and PvE, for
        example. Some characters have multiple different targets that you can select from. <strong>These targets, while
        directionally good for characters, are only a base suggestion!</strong> There are many reasons that you might
        want to pick different values than those listed by default in the optimizer: you might want to optimize for a
        different purpose (such as a phase 3 Sith Triumvirate Raid team, where speed can be detrimental), you might
        want to choose something different to optimize against, or you might simply have a better set of values that
        you want to employ.
      </p>
      <p>
        As a starting point, choose a target for each character that matches what you'd like to optimize for. If no
        such target exists, you can select "Custom", or simply hit the "Edit" button to bring up the character edit
        modal. Most characters will have the "basic" mode selected by default. In basic mode, you select a value for all
        stats that is between -100 and 100. These values are weights that are assigned to each stat to determine its
        value for that character. Setting two values as equal means that those stats are about equally important for
        that character. In basic mode, the optimizer will automatically adjust the weights to fit the range of values
        seen in-game for that stat. For example, giving speed and protection both a value of 100 means that 1 speed is
        about equivalent to 200 protection (since you find much more protection on mods than you do speed).
      </p>
      <p>
        If you want more fine-tuned control over the stat values, you can switch to "advanced" mode. In advanced mode,
        the values given are the value for each point of the listed stat. In advanced mode, if speed and protection are
        both given a value of 100, then the tool will never select speed, because it can more easily give that character
        much more protection. I suggest sticking to basic mode until you have a strong sense for how the tool works.
      </p>
      <p>
        I hope that you enjoy the tool! Happy modding!
      </p>
      <div className={'actions'}>
        <button type={'button'} onClick={() => this.props.hideModal()}>OK</button>
      </div>
    </div>;
  }

  /**
   * Renders an "Are you sure?" modal to reset all characters to their default optimization targets
   *
   * @return JSX Element
   */
  resetCharsModal() {
    return <div>
      <h2>Are you sure you want to reset all characters to defaults?</h2>
      <p>
        This will <strong>not</strong> overwrite any new optimization targets that you've saved, but if you've edited
        any existing targets, or if any new targets have been created that have the same name as one that you've made,
        then it will be overwritten.
      </p>
      <div className={'actions'}>
        <button type={'button'} onClick={() => this.props.hideModal()}>Cancel</button>
        <button type={'button'} className={'red'} onClick={() => this.props.resetAllCharacterTargets()}>Reset</button>
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  const profile = state.profiles[state.allyCode];
  const availableCharacters = Object.values(profile.characters)
    .filter(character => !profile.selectedCharacters.includes(character.baseID))
    .sort((left, right) => left.compareGP(right));

  const characterFilter = character =>
    '' === state.characterFilter || character.matchesFilter(state.characterFilter);

  return {
    allCharacters: profile.characters,
    mods: profile.mods,
    modChangeThreshold: profile.modChangeThreshold,
    characterFilter: state.characterFilter,
    highlightedCharacters: availableCharacters.filter(characterFilter),
    availableCharacters: availableCharacters.filter(c => !characterFilter(c)),
    selectedCharacters: profile.selectedCharacters.map(id => profile.characters[id])
  };
};

const mapDispatchToProps = dispatch => ({
  showModal: (clazz, content) => dispatch(showModal(clazz, content)),
  hideModal: () => dispatch(hideModal()),
  changeCharacterFilter: (filter) => dispatch(changeCharacterFilter(filter)),
  selectCharacter: (characterID, prevCharacterID) => dispatch(selectCharacter(characterID, prevCharacterID)),
  unselectCharacter: (characterID) => dispatch(unselectCharacter(characterID)),
  clearSelectedCharacters: () => dispatch(unselectAllCharacters()),
  lockSelectedCharacters: () => dispatch(lockSelectedCharacters()),
  unlockSelectedCharacters: () => dispatch(unlockSelectedCharacters()),
  changeCharacterTarget: (characterID, target) => dispatch(changeCharacterTarget(characterID, target)),
  resetAllCharacterTargets: () => dispatch(resetAllCharacterTargets()),
  optimizeMods: (mods, characters, order, threshold) => dispatch(optimizeMods(mods, characters, order, threshold)),
  updateModChangeThreshold: (threshold) => dispatch(updateModChangeThreshold(threshold))
});

export default connect(mapStateToProps, mapDispatchToProps)(CharacterEditView);

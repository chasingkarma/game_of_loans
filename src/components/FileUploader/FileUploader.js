import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from '../utils/classnames'
import uid from '../utils/uniqueId'
import './FileUploader.css'

export class FileUploaderButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    disableLabelChanges: PropTypes.bool,
    id: PropTypes.string,
    labelText: PropTypes.string,
    listFiles: PropTypes.bool,
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    role: PropTypes.string,
    tabIndex: PropTypes.number,
    buttonKind: PropTypes.oneOf(['primary', 'secondary']),
    accept: PropTypes.arrayOf(PropTypes.string),
  };
  static defaultProps = {
    tabIndex: 0,
    disableLabelChanges: false,
    labelText: 'Add file',
    buttonKind: 'primary',
    multiple: false,
    onChange: () => {},
    onClick: () => {},
    accept: [],
  };
  state = {
    labelText: this.props.labelText,
  };
  componentWillMount() {
    this.uid = this.props.id || uid();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.labelText !== this.props.labelText) {
      this.setState({ labelText: nextProps.labelText });
    }
  }

  handleChange = evt => {
    const files = evt.target.files;
    const length = evt.target.files.length;
    if (files && !this.props.disableLabelChanges) {
      if (length > 1) {
        this.setState({ labelText: `${length} files` });
      } else if (length === 1) {
        this.setState({ labelText: files[0].name });
      }
    }
    this.props.onChange(evt);
  };

  render() {
    const {
      className,
      disableLabelChanges, // eslint-disable-line
      labelText, // eslint-disable-line
      multiple,
      role,
      tabIndex,
      buttonKind,
      accept,
      ...other
    } = this.props;
    const classes = classNames({
      'file': true,
      [className]: className,
    });

    return (
      <div
        role="button"
        className={classes}
        tabIndex={tabIndex}
        onKeyDown={evt => {
          if (evt.which === 13 || evt.which === 32) {
            this.input.click();
          }
        }}>
        <label
          className={`btn btn--${buttonKind} btn--sm`}
          htmlFor={this.uid}
          role={role}
          {...other}>
          {this.state.labelText}
        </label>
        <input
          className="visually-hidden"
          ref={input => (this.input = input)}
          id={this.uid}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={this.handleChange}
          onClick={evt => {
            evt.target.value = null;
          }}
        />
      </div>
    );
  }
}

export class Filename extends Component {
  static propTypes = {
    style: PropTypes.object,
    status: PropTypes.oneOf(['edit', 'complete', 'uploading']),
    tabIndex: PropTypes.number,
    onKeyDown: PropTypes.func,
  };

  static defaultProps = {
    onKeyDown: () => {},
    status: 'uploading',
    style: {},
    tabIndex: 0,
  };

  render() {
    const { iconDescription, status, style, ...other } = this.props;

    if (status === 'uploading') {
      return (
        <div
          className="loading"
          style={{ ...style, width: '1rem', height: '1rem' }}
          {...other}>
          <svg className="loading__svg" viewBox="-42 -42 84 84">
            <circle cx="0" cy="0" r="37.5" />
          </svg>
        </div>
      );
    } else if (status === 'edit') {
      return (
        <div {...other}>
          <i className="fas fa-times-circle"/>
        </div>
      );
    } else if (status === 'complete') {
      return (
        <i className="fas fa-check-circle" {...other}/>
      );
    } else {
      return null;
    }
  }
}

export default class FileUploader extends Component {
  static propTypes = {
    iconDescription: PropTypes.string,
    buttonLabel: PropTypes.string,
    buttonKind: PropTypes.oneOf(['primary', 'secondary']),
    filenameStatus: PropTypes.oneOf(['edit', 'complete', 'uploading'])
      .isRequired,
    labelDescription: PropTypes.string,
    labelTitle: PropTypes.string,
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    className: PropTypes.string,
    accept: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    iconDescription: 'Provide icon description',
    filenameStatus: 'uploading',
    buttonLabel: '',
    buttonKind: 'primary',
    multiple: false,
    onChange: () => {},
    onClick: () => {},
    accept: [],
  };

  state = {
    filenames: [],
    filenameStatus: '',
  };

  nodes = [];

  componentWillReceiveProps(nextProps) {
    if (nextProps.filenameStatus !== this.props.filenameStatus) {
      this.setState({ filenameStatus: nextProps.filenameStatus });
    }
  }
  handleChange = evt => {
    this.setState({ filenames: [...evt.target.files].map(file => file.name) });
    this.props.onChange(evt);
  };

  handleClick = (evt, index) => {
    const filteredArray = this.state.filenames.filter(
      filename => filename !== this.nodes[index].innerText.trim()
    );
    this.setState({ filenames: filteredArray });
    this.props.onClick(evt);
  };

  clearFiles = () => {
    // A clearFiles function that resets filenames and can be referenced using a ref by the parent.
    this.setState({ filenames: [] });
  };

  render() {
    const {
      iconDescription,
      buttonLabel,
      buttonKind,
      filenameStatus,
      labelDescription,
      labelTitle,
      className,
      multiple,
      accept,
      ...other
    } = this.props;

    const classes = classNames({
      'form-item': true,
      [className]: className,
    });

    return (
      <div className={classes} {...other}>
        <strong className="label">{labelTitle}</strong>
        <p className="label-description">{labelDescription}</p>
        <FileUploaderButton
          labelText={buttonLabel}
          multiple={multiple}
          buttonKind={buttonKind}
          onChange={this.handleChange}
          disableLabelChanges
          accept={accept}
        />
        <div className="file-container">
          {this.state.filenames.length === 0
            ? null
            : this.state.filenames.map((name, index) => (
                <span
                  key={index}
                  className="file__selected-file"
                  ref={node => (this.nodes[index] = node)} // eslint-disable-line
                  {...other}>
                  <p className="file-filename">{name}</p>
                  <span className="file__state-container">
                    <Filename
                      iconDescription={iconDescription}
                      status={filenameStatus}
                      onClick={evt => {
                        if (filenameStatus === 'edit') {
                          this.handleClick(evt, index);
                        }
                      }}
                      iconDescription={iconDescription}
                      onKeyDown={evt => {
                        if (evt.which === 13 || evt.which === 32) {
                          this.handleClick(evt, index);
                        }
                      }}
                    />
                  </span>
                </span>
              ))}
        </div>
      </div>
    );
  }
}

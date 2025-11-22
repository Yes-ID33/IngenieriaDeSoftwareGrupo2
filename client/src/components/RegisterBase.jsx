import PropTypes from 'prop-types';

function Hello({ firstname, lastname }) {
  return <div>Hello {firstname} {lastname}</div>;
}
Hello.propTypes = {
  firstname: PropTypes.string.isRequired,
  lastname: PropTypes.string.isRequired,
};

// Using legacy APIs

class Hello extends React.Component {
  render() {
    return <div>Hello {this.props.firstname} {this.props.lastname}</div>;
  }
}
Hello.propTypes = {
  firstname: PropTypes.string.isRequired,
  lastname: PropTypes.string.isRequired,
};
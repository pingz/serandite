import React, {Component} from "react";

import {
  FormControl,
  FormGroup,
} from 'material-ui/Form';

import TextField from 'material-ui/TextField';
import Input, {InputLabel, InputAdornment} from 'material-ui/Input';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';

const octets_mask_uint32 = Uint32Array.of(4278190080, 16711680, 65280, 255);

const details = [
  "256 class A networks",
  "128 class A networks",
  "64 class A networks",
  "32 class A networks",
  "16 class A networks",
  "8 class A networks",
  "4 class A networks",
  "2 class A networks",
  "class A network or 256 class B networks, Largest IANA block allocation",
  "128 class B networks",
  "64 class B networks",
  "32 class B networks",
  "16 class B networks",
  "8 class B networks",
  "4 class B networks",
  "2 class B networks",
  "class B network or 256 class C networks",
  "128 class C networks, ISP/large business",
  "64 class C networks, ISP/large business",
  "32 class C networks, ISP/large business",
  "16 class C networks, small ISP/large business",
  "8 class C networks, small ISP/large business",
  "4 class C networks",
  "2 class C networks",
  "class C network, large LAN",
  "½ class C network, large LAN",
  "¼ class C network, small LAN",
  "⅛ class C network, small LAN",
  "small LAN",
  "Smallest multi-host network",
  "Point to point links (glue network)",
  "Point to point links (RFC 3021)",
  "Host route",
]

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit / 2,
  },
});

class Calc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      octets:  Uint8Array.of(203, 0, 113, 3),
      cidr_mask: 24,
      /* mask_options: [...Array(32).keys()] */
    };
  }

  handleAddressOctetChange(event, n) {
    let v = Number(event.target.value);
    if (v > 255) {
      v = 255
    }
    if (v < 0 ) {
      v = 0
    }
    let octets = this.state.octets;
    octets[n] = v;
    this.setState({octets: octets});
  }

  handleCidrMaskChange(event) {
    let v = Number(event.target.value);
    if (v > 32) {
      v = 32
    }
    if (v < 0) {
      v = 0
    }
    this.setState({cidr_mask: v});
  }

  octets2ip(octets) {
    return octets[3]
         + ((octets[2] << 8) >>> 0)
         + ((octets[1] << 16) >>> 0)
         + ((octets[0] << 24) >>> 0);
  }

  ip2octets(ip_uint32) {
    let octets_uint8 = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      octets_uint8[i] = (ip_uint32 & octets_mask_uint32[i]) >>> (24 - i * 8);
    }
    return octets_uint8;
  }

  maskLength2RoutingPrefixMask(mask_length) {
    if ( mask_length === 0 ) {
      return 0
    } else {
      return (4294967295 << (32 - mask_length)) >>> 0
    }
  }

  octetsToBinaryString(octets) {
    return Array.from(octets).map(o => Number(o).toString(2).padStart(8, "0")).join(".");
  }

  render() {
    const { classes } = this.props;
    const { octets, cidr_mask } = this.state;

    const mask_as_int = this.maskLength2RoutingPrefixMask(cidr_mask);
    const mask_as_octets = this.ip2octets(mask_as_int);
    const ip_as_int = this.octets2ip(octets);
    const routing_prefix_as_int = (ip_as_int & mask_as_int) >>> 0;
    const routing_prefix = this.ip2octets(routing_prefix_as_int);
    const number_of_addresses = 2 ** (32 - cidr_mask);
    /* const first_address = this.ip2octets(routing_prefix_as_int + 1); */
    const last_address = this.ip2octets(routing_prefix_as_int + number_of_addresses - 1);

    const AddressInput = (
      <FormGroup className={classes.textField} row style={{marginTop: "20px"}}>{
        [0, 1, 2, 3].map(n =>
          <Input
            key={n}
            onChange={e => this.handleAddressOctetChange(e, n)}
            inputProps={{
              value: octets[n],
              style: {
                fontFamily: "monospace",
                width: "3em",
                textAlign: "right",
              },
              size: 3,
              min: 0,
              max: 255,
            }}
            type="number"
          />
        ).reduce(
          (prev, cur) => [prev, '.', cur]
        )
      }
      </FormGroup>
    )

    return (<Grid container spacing={16}>
      <Grid item xs={12} md={6}><Paper className={classes.paper}>
        <FormControl>
          <InputLabel>IPv4 Address</InputLabel>
          { AddressInput }
        </FormControl>
        <TextField
          label="mask"
          type="number"
          className={classes.textField}
          value={cidr_mask}
          onChange={ e => this.handleCidrMaskChange(e) }
          InputProps={{
            startAdornment: <InputAdornment position="start">{"/"}</InputAdornment>,
            inputProps: {
              style: {
                fontFamily: "monospace",
                width: "2em",
                textAlign: "right",
              },
              size: 3,
              min: 0,
              max: 32,
            },
          }}
          margin="normal"
        />
        <TextField
          label="route prefix"
          className={classes.textField}
          value={ routing_prefix.join(".") }
          inputProps={{
            style: {
              fontFamily: "monospace"
            },
            size: 15,
          }}
          margin="normal"
        />
        <TextField
          label="mask(decimal)"
          className={classes.textField}
          value={mask_as_octets.join(".")}
          InputProps={{
            startAdornment: <InputAdornment position="start">{"/"}</InputAdornment>,
            inputProps: {
              style: {
                fontFamily: "monospace"
              },
              size: 15,
            }
          }}
          margin="normal"
        />
        <TextField
          label="last address"
          className={classes.textField}
          value={ last_address.join(".") }
          inputProps={{
            style: {
              fontFamily: "monospace"
            },
            size: 15,
          }}
          margin="normal"
        />
        <TextField
          label="addresses"
          className={classes.textField}
          value={number_of_addresses}
          inputProps={{
            style: {
              fontFamily: "monospace",
              textAlign: "right",
            },
            size: 14,
          }}
          margin="normal"
        />
        <h6>{"typical usage: "}</h6><p>{details[cidr_mask]}</p>
      </Paper></Grid>
      <Grid item xs={12} md={6}><Paper className={classes.paper}>
        <TextField
          className={classes.textField}
          label="ip address in binary (with dot)"
          value={ this.octetsToBinaryString(octets) }
          inputProps={{
            style: {
              fontFamily: "monospace"
            },
            size: 35,
          }}
          margin="normal"
        />
        <TextField
          className={classes.textField}
          label="subnet mask in binary (with dot)"
          value={ this.octetsToBinaryString(mask_as_octets) }
          InputProps={{
            startAdornment: <InputAdornment position="start">{"/"}</InputAdornment>,
            inputProps: {
              style: {
                fontFamily: "monospace"
              },
              size: 35,
            }
          }}
          margin="normal"
        />
        <TextField
          className={classes.textField}
          label="routing prefix"
          value={ this.octetsToBinaryString(routing_prefix) }
          inputProps={{
            style: {
              fontFamily: "monospace"
            },
            size: 35,
          }}
          margin="normal"
        />
        <TextField
          className={classes.textField}
          label="last address"
          value={ this.octetsToBinaryString(last_address) }
          inputProps={{
            style: {
              fontFamily: "monospace"
            },
            size: 35,
          }}
          margin="normal"
        />
      </Paper></Grid>
    </Grid>)
  }
}

export default withStyles(styles)(Calc);
